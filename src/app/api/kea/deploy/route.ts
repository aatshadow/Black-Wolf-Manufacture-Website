import { createClient } from '@supabase/supabase-js';

export const maxDuration = 60;

// KEA's own Supabase (source)
function getKeaAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// Blackwolf Central's Supabase (destination)
function getCentralAdmin() {
  return createClient(
    process.env.CENTRAL_SUPABASE_URL!,
    process.env.CENTRAL_SUPABASE_SERVICE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

interface DeployRequest {
  templateId: string;
  organizationId: string;
  // Client config for Blackwolf Central
  clientConfig: {
    name: string;
    slug: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
}

interface DeployResult {
  success: boolean;
  clientId?: string;
  created: {
    client: boolean;
    team: number;
    products: number;
    crmFields: number;
    pipeline: boolean;
  };
  errors: string[];
}

export async function POST(request: Request) {
  try {
    const { templateId, organizationId, clientConfig } = (await request.json()) as DeployRequest;

    if (!templateId || !organizationId || !clientConfig?.name || !clientConfig?.slug) {
      return Response.json(
        { error: 'templateId, organizationId, clientConfig.name and clientConfig.slug are required' },
        { status: 400 }
      );
    }

    const kea = getKeaAdmin();
    const central = getCentralAdmin();

    const result: DeployResult = {
      success: false,
      created: { client: false, team: 0, products: 0, crmFields: 0, pipeline: false },
      errors: [],
    };

    // ═══════════════════════════════════════════════════════════════
    // 1. LOAD ALL EXTRACTED DATA FROM KEA
    // ═══════════════════════════════════════════════════════════════

    // Load template with tracks → blocks → fields
    const { data: template } = await kea
      .from('templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (!template) {
      return Response.json({ error: 'Template not found' }, { status: 404 });
    }

    // Load all tracks for this template
    const { data: tracks } = await kea
      .from('tracks')
      .select('id, name, code')
      .eq('template_id', templateId);

    if (!tracks?.length) {
      return Response.json({ error: 'No tracks found for template' }, { status: 404 });
    }

    // Load all blocks
    const trackIds = tracks.map((t) => t.id);
    const { data: blocks } = await kea
      .from('schema_blocks')
      .select('id, name, code, track_id')
      .in('track_id', trackIds);

    if (!blocks?.length) {
      return Response.json({ error: 'No schema blocks found' }, { status: 404 });
    }

    // Load all extraction instances (the actual extracted data)
    const blockIds = blocks.map((b) => b.id);
    const { data: instances } = await kea
      .from('extraction_instances')
      .select('id, block_id, instance_label, data, completeness_pct')
      .eq('organization_id', organizationId)
      .in('block_id', blockIds);

    // Build a map: block_code → extracted data
    const blockCodeMap = new Map(blocks.map((b) => [b.id, b.code]));
    const extractedData: Record<string, Record<string, unknown>> = {};
    for (const inst of instances || []) {
      const code = blockCodeMap.get(inst.block_id);
      if (code && inst.data) {
        extractedData[code] = inst.data as Record<string, unknown>;
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // 2. CREATE CLIENT IN BLACKWOLF CENTRAL
    // ═══════════════════════════════════════════════════════════════

    const { data: newClient, error: clientError } = await central
      .from('clients')
      .insert({
        name: clientConfig.name,
        slug: clientConfig.slug,
        primary_color: clientConfig.primaryColor || '#3B82F6',
        secondary_color: clientConfig.secondaryColor || '#60A5FA',
        bg_color: '#0A0A0A',
        bg_card_color: '#111111',
        bg_sidebar_color: '#0D0D0D',
        border_color: '#1F1F1F',
        text_color: '#FFFFFF',
        text_secondary_color: '#A0A0A0',
        active: true,
      })
      .select('id')
      .single();

    if (clientError || !newClient) {
      result.errors.push(`Failed to create client: ${clientError?.message}`);
      return Response.json(result, { status: 500 });
    }

    result.clientId = newClient.id;
    result.created.client = true;
    const clientId = newClient.id;

    // ═══════════════════════════════════════════════════════════════
    // 3. DEPLOY TEAM MEMBERS (from users_roles block)
    // ═══════════════════════════════════════════════════════════════

    const usersData = extractedData['users_roles'];
    if (usersData) {
      // Try to parse roles_list which should be a JSON array
      const rolesList = parseJsonField(usersData['roles_list']);
      const userCount = Number(usersData['user_count']) || 1;
      const orgStructure = String(usersData['org_structure'] || '');

      // Create at least one admin user
      const { error: adminErr } = await central
        .from('team')
        .insert({
          client_id: clientId,
          name: 'Admin',
          email: `admin@${clientConfig.slug}.com`,
          password: 'changeme123',
          role: 'ceo,director',
          active: true,
          commission_rate: 0,
        });

      if (!adminErr) result.created.team++;

      // If we have structured role data, create team members for each role
      if (Array.isArray(rolesList)) {
        for (const role of rolesList) {
          const roleName = typeof role === 'string' ? role : (role as Record<string, unknown>)?.name || (role as Record<string, unknown>)?.role;
          if (!roleName || roleName === 'admin' || roleName === 'administrador') continue;

          const mappedRole = mapKeaRoleToCentral(String(roleName));
          const { error: teamErr } = await central
            .from('team')
            .insert({
              client_id: clientId,
              name: String(roleName),
              email: `${sanitizeSlug(String(roleName))}@${clientConfig.slug}.com`,
              password: 'changeme123',
              role: mappedRole,
              active: true,
              commission_rate: 0,
            });

          if (!teamErr) result.created.team++;
          else result.errors.push(`Team member "${roleName}": ${teamErr.message}`);
        }
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // 4. DEPLOY PRODUCTS (from BOM / production data)
    // ═══════════════════════════════════════════════════════════════

    const bomData = extractedData['bom'];
    const salesData = extractedData['sales'];

    // Extract products from BOM
    if (bomData) {
      const productName = bomData['finished_product'];
      const productCode = bomData['product_code'];
      const estimatedCost = Number(bomData['estimated_cost']) || 0;

      if (productName) {
        const { error: prodErr } = await central
          .from('products')
          .insert({
            client_id: clientId,
            name: String(productName),
            price: estimatedCost,
            active: true,
          });

        if (!prodErr) result.created.products++;
        else result.errors.push(`Product "${productName}": ${prodErr.message}`);
      }
    }

    // Extract products from sales data (price lists, channels)
    if (salesData) {
      const priceListsRaw = salesData['price_lists'];
      if (typeof priceListsRaw === 'string' && priceListsRaw.length > 0) {
        // Try to extract product names from price list description
        const products = extractProductNames(priceListsRaw);
        for (const prod of products) {
          const { error: prodErr } = await central
            .from('products')
            .insert({
              client_id: clientId,
              name: prod,
              price: 0,
              active: true,
            });

          if (!prodErr) result.created.products++;
        }
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // 5. DEPLOY CRM CUSTOM FIELDS (from extracted schema knowledge)
    // ═══════════════════════════════════════════════════════════════

    // Create CRM fields based on what was discovered in sales & supply chain
    const crmFieldsToCreate: Array<{
      name: string;
      field_key: string;
      field_type: string;
      options?: unknown[];
    }> = [];

    // From sales block
    if (salesData) {
      const channels = salesData['sales_channels'];
      if (channels) {
        crmFieldsToCreate.push({
          name: 'Canal de Venta',
          field_key: 'sales_channel',
          field_type: 'select',
          options: Array.isArray(channels) ? channels.map((c: unknown) => String(c)) : [],
        });
      }

      if (salesData['quotations']) {
        crmFieldsToCreate.push({
          name: 'Estado de Cotización',
          field_key: 'quotation_status',
          field_type: 'select',
          options: ['Pendiente', 'Enviada', 'Aceptada', 'Rechazada'],
        });
      }

      if (salesData['payment_tracking']) {
        crmFieldsToCreate.push({
          name: 'Estado de Pago',
          field_key: 'payment_status',
          field_type: 'select',
          options: ['Pendiente', 'Parcial', 'Pagado', 'Vencido'],
        });
      }
    }

    // From finance block
    const financeData = extractedData['finance'];
    if (financeData) {
      const paymentMethods = financeData['payment_methods'];
      if (paymentMethods) {
        crmFieldsToCreate.push({
          name: 'Método de Pago',
          field_key: 'payment_method',
          field_type: 'select',
          options: Array.isArray(paymentMethods) ? paymentMethods.map((m: unknown) => String(m)) : [],
        });
      }

      const currencies = financeData['currencies'];
      if (currencies) {
        crmFieldsToCreate.push({
          name: 'Moneda',
          field_key: 'currency',
          field_type: 'select',
          options: Array.isArray(currencies) ? currencies.map((c: unknown) => String(c)) : ['BGN', 'EUR'],
        });
      }
    }

    // From supply chain
    const supplyData = extractedData['supply_chain'];
    if (supplyData) {
      crmFieldsToCreate.push({
        name: 'Lead Time',
        field_key: 'lead_time_days',
        field_type: 'number',
      });

      if (supplyData['main_suppliers']) {
        crmFieldsToCreate.push({
          name: 'Proveedor Preferido',
          field_key: 'preferred_supplier',
          field_type: 'text',
        });
      }
    }

    // From warehouse
    const warehouseData = extractedData['warehouse'];
    if (warehouseData) {
      const warehouses = parseJsonField(warehouseData['warehouses_list']);
      if (Array.isArray(warehouses)) {
        crmFieldsToCreate.push({
          name: 'Almacén de Entrega',
          field_key: 'delivery_warehouse',
          field_type: 'select',
          options: warehouses.map((w: unknown) =>
            typeof w === 'string' ? w : (w as Record<string, unknown>)?.name || 'Unknown'
          ),
        });
      }
    }

    // From logistics
    const logisticsData = extractedData['logistics'];
    if (logisticsData) {
      const zones = logisticsData['coverage_zones'];
      if (zones) {
        crmFieldsToCreate.push({
          name: 'Zona de Entrega',
          field_key: 'delivery_zone',
          field_type: 'text',
        });
      }
    }

    // Insert all CRM fields
    for (let i = 0; i < crmFieldsToCreate.length; i++) {
      const field = crmFieldsToCreate[i];
      const { error: fieldErr } = await central
        .from('crm_custom_fields')
        .insert({
          client_id: clientId,
          name: field.name,
          field_key: field.field_key,
          field_type: field.field_type,
          options: field.options || [],
          position: i,
          active: true,
        });

      if (!fieldErr) result.created.crmFields++;
      else result.errors.push(`CRM field "${field.name}": ${fieldErr.message}`);
    }

    // ═══════════════════════════════════════════════════════════════
    // 6. CREATE DEFAULT CRM PIPELINE
    // ═══════════════════════════════════════════════════════════════

    const { error: pipelineErr } = await central
      .from('crm_pipelines')
      .insert({
        client_id: clientId,
        name: 'Pipeline Principal',
        is_default: true,
        stages: [
          { key: 'lead', label: 'Lead', color: '#6366F1' },
          { key: 'contacted', label: 'Contactado', color: '#F59E0B' },
          { key: 'qualified', label: 'Cualificado', color: '#3B82F6' },
          { key: 'proposal', label: 'Propuesta', color: '#8B5CF6' },
          { key: 'negotiation', label: 'Negociación', color: '#EC4899' },
          { key: 'won', label: 'Ganado', color: '#10B981' },
          { key: 'lost', label: 'Perdido', color: '#EF4444' },
        ],
      });

    if (!pipelineErr) result.created.pipeline = true;
    else result.errors.push(`Pipeline: ${pipelineErr.message}`);

    // ═══════════════════════════════════════════════════════════════
    // 7. CREATE PAYMENT FEES (from finance data)
    // ═══════════════════════════════════════════════════════════════

    if (financeData) {
      const methods = financeData['payment_methods'];
      if (Array.isArray(methods)) {
        for (const method of methods) {
          await central.from('payment_fees').insert({
            client_id: clientId,
            method: String(method),
            fee_rate: 0,
          });
        }
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // 8. CREATE SUPERADMIN COMMISSION ENTRY
    // ═══════════════════════════════════════════════════════════════

    await central.from('superadmin_commissions').insert({
      client_id: clientId,
      commission_rate: 0,
    });

    result.success = true;

    return Response.json(result);
  } catch (error) {
    console.error('Deploy error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ═══════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

function parseJsonField(value: unknown): unknown {
  if (Array.isArray(value) || (typeof value === 'object' && value !== null)) return value;
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch { return value; }
  }
  return value;
}

function sanitizeSlug(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function mapKeaRoleToCentral(keaRole: string): string {
  const lower = keaRole.toLowerCase();
  if (lower.includes('director') || lower.includes('gerente')) return 'director';
  if (lower.includes('ceo') || lower.includes('dueño') || lower.includes('owner')) return 'ceo';
  if (lower.includes('vendedor') || lower.includes('closer') || lower.includes('ventas')) return 'closer';
  if (lower.includes('setter') || lower.includes('agendador')) return 'setter';
  if (lower.includes('contador') || lower.includes('contable') || lower.includes('finanz')) return 'director';
  if (lower.includes('almacen') || lower.includes('bodega') || lower.includes('warehouse')) return 'gestor';
  if (lower.includes('producción') || lower.includes('produccion') || lower.includes('planta')) return 'manager';
  return 'closer';
}

function extractProductNames(priceListText: string): string[] {
  // Try to extract product names from descriptive text
  const products: string[] = [];
  const lines = priceListText.split(/[,\n;]/);
  for (const line of lines) {
    const cleaned = line.trim();
    if (cleaned.length > 2 && cleaned.length < 100) {
      products.push(cleaned);
    }
  }
  return products.slice(0, 20); // Cap at 20 products
}
