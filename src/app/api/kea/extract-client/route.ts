import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('organizationId');
    const format = searchParams.get('format') || 'json';

    if (!orgId) {
      return Response.json({ error: 'organizationId is required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Load organization
    const { data: org } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', orgId)
      .single();

    if (!org) {
      return Response.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Load template + tracks + blocks + fields
    const { data: template } = await supabase
      .from('templates')
      .select('*')
      .eq('id', org.active_template_id)
      .single();

    const tracks: Array<{
      id: string;
      name: string;
      code: string;
      blocks: Array<{
        id: string;
        name: string;
        code: string;
        fields: Array<{ name: string; code: string; field_type: string; is_required: boolean }>;
      }>;
    }> = [];

    if (template) {
      const { data: trackRows } = await supabase
        .from('tracks')
        .select('id, name, code, display_order')
        .eq('template_id', template.id)
        .order('display_order');

      if (trackRows) {
        for (const track of trackRows) {
          const { data: blockRows } = await supabase
            .from('schema_blocks')
            .select('id, name, code, display_order')
            .eq('track_id', track.id)
            .order('display_order');

          const blocks = [];
          for (const block of blockRows || []) {
            const { data: fieldRows } = await supabase
              .from('schema_fields')
              .select('name, code, field_type, is_required')
              .eq('block_id', block.id)
              .order('display_order');

            blocks.push({
              id: block.id,
              name: block.name,
              code: block.code,
              fields: fieldRows || [],
            });
          }

          tracks.push({
            id: track.id,
            name: track.name,
            code: track.code,
            blocks,
          });
        }
      }
    }

    // Load all extraction instances
    const blockIds = tracks.flatMap((t) => t.blocks.map((b) => b.id));
    let instances: Array<{
      id: string;
      block_id: string;
      instance_label: string;
      data: Record<string, unknown>;
      completeness_pct: number;
      status: string;
    }> = [];

    if (blockIds.length > 0) {
      const { data } = await supabase
        .from('extraction_instances')
        .select('id, block_id, instance_label, data, completeness_pct, status')
        .eq('organization_id', orgId)
        .in('block_id', blockIds);
      instances = data || [];
    }

    // Build structured extraction output
    const extraction: Record<string, Record<string, unknown>> = {};

    for (const track of tracks) {
      const trackData: Record<string, unknown> = {};

      for (const block of track.blocks) {
        const blockInstances = instances.filter((i) => i.block_id === block.id);

        if (blockInstances.length === 0) {
          trackData[block.code] = null;
        } else if (blockInstances.length === 1) {
          trackData[block.code] = blockInstances[0].data;
        } else {
          trackData[block.code] = blockInstances.map((i) => ({
            _label: i.instance_label,
            ...i.data,
          }));
        }
      }

      extraction[track.code] = trackData;
    }

    const result = {
      organization: {
        id: org.id,
        name: org.name,
        slug: org.slug,
        industry: org.industry,
      },
      template: template ? { id: template.id, name: template.name } : null,
      extracted_at: new Date().toISOString(),
      data: extraction,
    };

    if (format === 'csv') {
      // Flatten to CSV
      const rows: string[][] = [];
      rows.push(['track', 'block', 'field', 'value']);

      for (const track of tracks) {
        for (const block of track.blocks) {
          const blockInstances = instances.filter((i) => i.block_id === block.id);
          for (const inst of blockInstances) {
            const data = inst.data || {};
            for (const field of block.fields) {
              const val = data[field.code];
              rows.push([
                track.code,
                block.code,
                field.code,
                val != null ? String(val) : '',
              ]);
            }
          }
          if (blockInstances.length === 0) {
            for (const field of block.fields) {
              rows.push([track.code, block.code, field.code, '']);
            }
          }
        }
      }

      const csvContent = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');

      return new Response(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${org.slug}-extraction-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    return Response.json(result);
  } catch (error) {
    console.error('Extract client error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
