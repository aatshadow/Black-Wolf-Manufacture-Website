import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 60;

const anthropic = new Anthropic();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ExtractionItem {
  block_code: string;
  field_code: string;
  value: unknown;
  confidence: number;
  source_quote: string;
}

interface IncomingMessage {
  id?: string;
  role: string;
  content: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const sessionId = body.sessionId as string;
    const messages = (body.latestMessages || body.messages) as IncomingMessage[];

    if (!sessionId || !messages?.length) {
      return Response.json(
        { error: 'sessionId and messages are required' },
        { status: 400 }
      );
    }

    // ── 1. Load session ──────────────────────────────────────────────
    const { data: session, error: sessionErr } = await supabase
      .from('sessions')
      .select('id, organization_id, track_id')
      .eq('id', sessionId)
      .single();

    if (sessionErr || !session) {
      return Response.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    const { organization_id, track_id } = session;

    // ── 2. Load track → blocks → fields ──────────────────────────────
    const { data: blocks, error: blocksErr } = await supabase
      .from('schema_blocks')
      .select('id, name, code, schema_fields ( id, name, code, field_type, description, question_hint, is_required )')
      .eq('track_id', track_id)
      .order('display_order');

    if (blocksErr || !blocks?.length) {
      return Response.json(
        { success: true, extractionsCount: 0, alertsCount: 0, note: 'No schema blocks found' }
      );
    }

    // ── 3. Load existing extraction instances for these blocks ───────
    const blockIds = blocks.map((b) => b.id);
    const { data: existingInstances } = await supabase
      .from('extraction_instances')
      .select('id, block_id, data, source_messages, status')
      .eq('organization_id', organization_id)
      .in('block_id', blockIds);

    const instanceByBlock = new Map(
      (existingInstances ?? []).map((inst) => [inst.block_id, inst])
    );

    // ── 4. Build extraction prompt ───────────────────────────────────
    const schemaDescription = blocks
      .map((block) => {
        const fields = (block.schema_fields as Array<{
          code: string;
          name: string;
          field_type: string;
          description: string | null;
          question_hint: string | null;
          is_required: boolean;
        }>) ?? [];
        const fieldLines = fields
          .map(
            (f) =>
              `    - ${f.name} (code: "${f.code}", type: ${f.field_type})${f.description ? ` — ${f.description}` : ''}${f.is_required ? ' [REQUIRED]' : ''}`
          )
          .join('\n');
        return `  Block: "${block.name}" (code: "${block.code}")\n${fieldLines}`;
      })
      .join('\n\n');

    const systemPrompt = `You are an extraction engine. Analyze the conversation below and extract structured data that maps to the schema fields.

SCHEMA:
${schemaDescription}

For each piece of information found, output a JSON array of extractions:
[
  {
    "block_code": "...",
    "field_code": "...",
    "value": <extracted value>,
    "confidence": 0.0-1.0,
    "source_quote": "exact quote from conversation"
  }
]

RULES:
- Only extract information explicitly stated by the user
- Never infer or assume values
- Confidence: 1.0 = explicitly stated, 0.8 = strongly implied, 0.6 = somewhat implied
- If a value contradicts a previously extracted value, still extract it with the new value
- Output ONLY the JSON array, nothing else
- If no information can be extracted, output an empty array: []`;

    const conversationText = messages
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n\n');

    // ── 5. Call Claude (non-streaming) ───────────────────────────────
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: conversationText }],
    });

    const rawText =
      response.content[0].type === 'text' ? response.content[0].text : '';

    // ── 6. Parse extractions ─────────────────────────────────────────
    let extractions: ExtractionItem[] = [];
    try {
      const jsonMatch = rawText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        extractions = JSON.parse(jsonMatch[0]);
      }
    } catch {
      console.error('Failed to parse extraction JSON:', rawText.slice(0, 200));
      return Response.json({
        success: false,
        error: 'Failed to parse extraction response',
      });
    }

    if (!extractions.length) {
      return Response.json({
        success: true,
        extractionsCount: 0,
        alertsCount: 0,
      });
    }

    // Build lookup: block_code → block row
    const blockByCode = new Map(blocks.map((b) => [b.code, b]));

    // Collect message IDs from the incoming messages
    const messageIds = messages.filter((m) => m.id).map((m) => m.id as string);

    let alertsCount = 0;
    const touchedBlockIds = new Set<string>();

    // ── 7. Process each extraction ───────────────────────────────────
    for (const ext of extractions) {
      const block = blockByCode.get(ext.block_code);
      if (!block) continue;

      touchedBlockIds.add(block.id);

      // Find or create extraction_instance for this block
      let instance = instanceByBlock.get(block.id);

      if (!instance) {
        const { data: created, error: createErr } = await supabase
          .from('extraction_instances')
          .insert({
            organization_id,
            block_id: block.id,
            instance_label: block.name,
            data: {},
            completeness_pct: 0,
            status: 'in_progress',
            source_messages: messageIds,
          })
          .select('id, block_id, data, source_messages, status')
          .single();

        if (createErr || !created) {
          console.error('Failed to create extraction instance:', createErr);
          continue;
        }

        instance = created;
        instanceByBlock.set(block.id, instance);
      }

      const currentData = (instance.data ?? {}) as Record<string, unknown>;
      const oldValue = currentData[ext.field_code] ?? null;
      const newValue = ext.value;

      // ── 8. Detect contradictions ─────────────────────────────────
      if (
        oldValue !== null &&
        oldValue !== undefined &&
        JSON.stringify(oldValue) !== JSON.stringify(newValue)
      ) {
        const { error: alertErr } = await supabase.from('alerts').insert({
          organization_id,
          type: 'contradiction',
          severity: 'medium',
          title: `Contradicting value for ${ext.field_code}`,
          description: `Field "${ext.field_code}" in block "${ext.block_code}" changed from ${JSON.stringify(oldValue)} to ${JSON.stringify(newValue)}. Source: "${ext.source_quote}"`,
          related_instances: [instance.id],
          related_messages: messageIds,
          status: 'open',
        });
        if (!alertErr) alertsCount++;
      }

      // Update the data object
      currentData[ext.field_code] = newValue;

      // Calculate completeness for this block
      const fields = (block.schema_fields as Array<{ code: string }>) ?? [];
      const totalFields = fields.length;
      const filledFields = totalFields > 0
        ? fields.filter((f) => currentData[f.code] != null).length
        : 0;
      const completeness = totalFields > 0
        ? Math.round((filledFields / totalFields) * 100)
        : 0;

      // Merge source_messages
      const existingMsgIds = (instance.source_messages ?? []) as string[];
      const mergedMsgIds = [...new Set([...existingMsgIds, ...messageIds])];

      // ── Upsert extraction_instance ──────────────────────────────
      const { error: updateErr } = await supabase
        .from('extraction_instances')
        .update({
          data: currentData,
          completeness_pct: completeness,
          source_messages: mergedMsgIds,
        })
        .eq('id', instance.id);

      if (updateErr) {
        console.error(`[EXTRACT] Update failed for ${instance.id}:`, updateErr.message);
      }

      // Keep local cache in sync
      instance.data = currentData;
      instance.source_messages = mergedMsgIds;

      // ── 9. Log to extraction_history ────────────────────────────
      await supabase.from('extraction_history').insert({
        instance_id: instance.id,
        field_code: ext.field_code,
        old_value: oldValue != null ? JSON.stringify(oldValue) : null,
        new_value: JSON.stringify(newValue),
        source: 'bot_extracted',
        confidence: ext.confidence,
        source_message_id: messageIds[messageIds.length - 1] ?? null,
      });
    }

    // ── 10. Update progress_snapshots ────────────────────────────────
    // Calculate overall track completeness
    let totalFieldsAll = 0;
    let filledFieldsAll = 0;
    let confirmedFieldsAll = 0;

    for (const block of blocks) {
      const fields = (block.schema_fields as Array<{ code: string }>) ?? [];
      totalFieldsAll += fields.length;

      const inst = instanceByBlock.get(block.id);
      if (inst) {
        const data = (inst.data ?? {}) as Record<string, unknown>;
        const filled = fields.filter((f) => data[f.code] != null).length;
        filledFieldsAll += filled;
        if (inst.status === 'confirmed') {
          confirmedFieldsAll += filled;
        }
      }
    }

    const overallCompleteness = totalFieldsAll > 0
      ? Math.round((filledFieldsAll / totalFieldsAll) * 100)
      : 0;

    const today = new Date().toISOString().split('T')[0];

    // Upsert track-level progress snapshot
    const { data: existingSnapshot } = await supabase
      .from('progress_snapshots')
      .select('id')
      .eq('organization_id', organization_id)
      .eq('track_id', track_id)
      .is('block_id', null)
      .eq('snapshot_date', today)
      .maybeSingle();

    if (existingSnapshot) {
      await supabase
        .from('progress_snapshots')
        .update({
          completeness_pct: overallCompleteness,
          fields_total: totalFieldsAll,
          fields_filled: filledFieldsAll,
          fields_confirmed: confirmedFieldsAll,
        })
        .eq('id', existingSnapshot.id);
    } else {
      await supabase.from('progress_snapshots').insert({
        organization_id,
        track_id,
        block_id: null,
        completeness_pct: overallCompleteness,
        fields_total: totalFieldsAll,
        fields_filled: filledFieldsAll,
        fields_confirmed: confirmedFieldsAll,
        snapshot_date: today,
      });
    }

    // Also upsert per-block snapshots for touched blocks
    for (const blockId of touchedBlockIds) {
      const block = blocks.find((b) => b.id === blockId);
      if (!block) continue;

      const fields = (block.schema_fields as Array<{ code: string }>) ?? [];
      const inst = instanceByBlock.get(blockId);
      const data = ((inst?.data) ?? {}) as Record<string, unknown>;
      const filled = fields.filter((f) => data[f.code] != null).length;
      const confirmed = inst?.status === 'confirmed' ? filled : 0;
      const pct = fields.length > 0 ? Math.round((filled / fields.length) * 100) : 0;

      const { data: existingBlockSnap } = await supabase
        .from('progress_snapshots')
        .select('id')
        .eq('organization_id', organization_id)
        .eq('track_id', track_id)
        .eq('block_id', blockId)
        .eq('snapshot_date', today)
        .maybeSingle();

      if (existingBlockSnap) {
        await supabase
          .from('progress_snapshots')
          .update({
            completeness_pct: pct,
            fields_total: fields.length,
            fields_filled: filled,
            fields_confirmed: confirmed,
          })
          .eq('id', existingBlockSnap.id);
      } else {
        await supabase.from('progress_snapshots').insert({
          organization_id,
          track_id,
          block_id: blockId,
          completeness_pct: pct,
          fields_total: fields.length,
          fields_filled: filled,
          fields_confirmed: confirmed,
          snapshot_date: today,
        });
      }
    }

    return Response.json({
      success: true,
      extractionsCount: extractions.length,
      alertsCount,
    });
  } catch (error) {
    console.error('Extraction engine error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
