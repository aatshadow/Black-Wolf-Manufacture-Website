import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

interface FieldInput {
  name: string;
  code: string;
  field_type: string;
  description?: string;
  question_hint?: string;
  is_required?: boolean;
  is_bot_critical?: boolean;
  group_label?: string;
}

interface BlockInput {
  name: string;
  code: string;
  description?: string;
  is_repeatable?: boolean;
  icon?: string;
  fields?: FieldInput[];
}

interface TrackInput {
  name: string;
  code: string;
  description?: string;
  conversation_style?: string;
  target_role?: string;
  bot_personality?: string;
  blocks?: BlockInput[];
}

interface SchemaInput {
  template: {
    name: string;
    description?: string;
    industry: string;
  };
  tracks: TrackInput[];
}

export async function POST(request: Request) {
  try {
    const { schema, organizationId, userId } = await request.json() as {
      schema: SchemaInput;
      organizationId: string;
      userId: string;
    };

    if (!schema || !organizationId) {
      return Response.json({ error: 'Schema and organizationId required' }, { status: 400 });
    }

    const supabase = getAdminClient();

    // 1. Create template
    const { data: template, error: templateError } = await supabase
      .from('templates')
      .insert({
        name: schema.template.name,
        description: schema.template.description || null,
        industry: schema.template.industry,
        organization_id: organizationId,
        created_by: userId || null,
      })
      .select()
      .single();

    if (templateError) {
      return Response.json({ error: 'Failed to create template', detail: templateError }, { status: 500 });
    }

    // 2. Create tracks, blocks, and fields
    for (let ti = 0; ti < schema.tracks.length; ti++) {
      const trackInput = schema.tracks[ti];

      const { data: track, error: trackError } = await supabase
        .from('tracks')
        .insert({
          template_id: template.id,
          name: trackInput.name,
          code: trackInput.code,
          description: trackInput.description || null,
          bot_personality: trackInput.bot_personality || '',
          conversation_style: trackInput.conversation_style || 'open_ended',
          target_role: trackInput.target_role || 'general',
          display_order: ti,
        })
        .select()
        .single();

      if (trackError) {
        console.error('Track error:', trackError);
        continue;
      }

      if (!trackInput.blocks) continue;

      for (let bi = 0; bi < trackInput.blocks.length; bi++) {
        const blockInput = trackInput.blocks[bi];

        const { data: block, error: blockError } = await supabase
          .from('schema_blocks')
          .insert({
            track_id: track.id,
            name: blockInput.name,
            code: blockInput.code,
            description: blockInput.description || null,
            is_repeatable: blockInput.is_repeatable || false,
            display_order: bi,
            icon: blockInput.icon || null,
          })
          .select()
          .single();

        if (blockError) {
          console.error('Block error:', blockError);
          continue;
        }

        if (!blockInput.fields) continue;

        const fieldsToInsert = blockInput.fields.map((field, fi) => ({
          block_id: block.id,
          name: field.name,
          code: field.code,
          field_type: field.field_type || 'text',
          description: field.description || null,
          question_hint: field.question_hint || null,
          is_required: field.is_required || false,
          is_bot_critical: field.is_bot_critical || false,
          display_order: fi,
          group_label: field.group_label || null,
        }));

        const { error: fieldsError } = await supabase
          .from('schema_fields')
          .insert(fieldsToInsert);

        if (fieldsError) {
          console.error('Fields error:', fieldsError);
        }
      }
    }

    return Response.json({
      success: true,
      templateId: template.id,
      message: `Template "${template.name}" created successfully`,
    });
  } catch (error) {
    console.error('Schema creation error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
