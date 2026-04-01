import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST(request: Request) {
  try {
    const { templateId, targetOrganizationId } = await request.json();

    if (!templateId || !targetOrganizationId) {
      return Response.json(
        { error: 'templateId and targetOrganizationId are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // 1. Load source template
    const { data: source, error: srcErr } = await supabase
      .from('templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (srcErr || !source) {
      return Response.json({ error: 'Template not found' }, { status: 404 });
    }

    // 2. Check if org already has a cloned template from this source — skip if so
    const { data: existing } = await supabase
      .from('templates')
      .select('id')
      .eq('organization_id', targetOrganizationId)
      .limit(1);

    if (existing && existing.length > 0) {
      // Org already has a template — update active_template_id and return
      await supabase
        .from('organizations')
        .update({ active_template_id: existing[0].id })
        .eq('id', targetOrganizationId);

      return Response.json({
        success: true,
        templateId: existing[0].id,
        cloned: false,
        message: 'Organization already has a template assigned',
      });
    }

    // 3. Clone the template
    const { data: newTemplate, error: tmplErr } = await supabase
      .from('templates')
      .insert({
        name: source.name,
        description: source.description,
        industry: source.industry,
        version: 1,
        is_public: false,
        created_by: source.created_by,
        organization_id: targetOrganizationId,
      })
      .select('id')
      .single();

    if (tmplErr || !newTemplate) {
      return Response.json({ error: `Failed to clone template: ${tmplErr?.message}` }, { status: 500 });
    }

    // 4. Load source tracks
    const { data: sourceTracks } = await supabase
      .from('tracks')
      .select('*')
      .eq('template_id', templateId)
      .order('display_order');

    if (!sourceTracks || sourceTracks.length === 0) {
      // Template with no tracks — just set active_template_id
      await supabase
        .from('organizations')
        .update({ active_template_id: newTemplate.id })
        .eq('id', targetOrganizationId);

      return Response.json({ success: true, templateId: newTemplate.id, cloned: true, tracks: 0, blocks: 0, fields: 0 });
    }

    let totalBlocks = 0;
    let totalFields = 0;

    for (const track of sourceTracks) {
      // 5. Clone each track
      const { data: newTrack, error: trackErr } = await supabase
        .from('tracks')
        .insert({
          template_id: newTemplate.id,
          name: track.name,
          code: track.code,
          description: track.description,
          bot_personality: track.bot_personality,
          conversation_style: track.conversation_style,
          target_role: track.target_role,
          display_order: track.display_order,
        })
        .select('id')
        .single();

      if (trackErr || !newTrack) continue;

      // 6. Load source blocks for this track
      const { data: sourceBlocks } = await supabase
        .from('schema_blocks')
        .select('*')
        .eq('track_id', track.id)
        .order('display_order');

      if (!sourceBlocks) continue;

      for (const block of sourceBlocks) {
        totalBlocks++;

        // 7. Clone each block
        const { data: newBlock, error: blockErr } = await supabase
          .from('schema_blocks')
          .insert({
            track_id: newTrack.id,
            name: block.name,
            code: block.code,
            description: block.description,
            is_repeatable: block.is_repeatable,
            display_order: block.display_order,
            icon: block.icon,
          })
          .select('id')
          .single();

        if (blockErr || !newBlock) continue;

        // 8. Load and clone fields
        const { data: sourceFields } = await supabase
          .from('schema_fields')
          .select('*')
          .eq('block_id', block.id)
          .order('display_order');

        if (sourceFields && sourceFields.length > 0) {
          const fieldInserts = sourceFields.map((f) => ({
            block_id: newBlock.id,
            name: f.name,
            code: f.code,
            field_type: f.field_type,
            description: f.description,
            question_hint: f.question_hint,
            is_required: f.is_required,
            is_bot_critical: f.is_bot_critical,
            validation_rules: f.validation_rules,
            depends_on: f.depends_on,
            default_value: f.default_value,
            display_order: f.display_order,
            group_label: f.group_label,
          }));

          await supabase.from('schema_fields').insert(fieldInserts);
          totalFields += sourceFields.length;
        }
      }
    }

    // 9. Set active_template_id on the organization
    await supabase
      .from('organizations')
      .update({ active_template_id: newTemplate.id })
      .eq('id', targetOrganizationId);

    return Response.json({
      success: true,
      templateId: newTemplate.id,
      cloned: true,
      tracks: sourceTracks.length,
      blocks: totalBlocks,
      fields: totalFields,
    });
  } catch (error) {
    console.error('Clone template error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
