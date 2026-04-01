import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import {
  buildTrackABasePrompt,
  buildTrackBBasePrompt,
  buildSchemaContext,
  buildAccumulatedKnowledge,
  buildSessionContext,
  type SchemaFieldForPrompt,
} from '@/lib/kea/ai/track-prompts';

const anthropic = new Anthropic();

export const maxDuration = 60;

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST(request: Request) {
  try {
    const { sessionId, trackId, message, organizationId, userId, language } =
      await request.json();

    if (!trackId || !message || !organizationId || !userId) {
      return Response.json(
        { error: 'trackId, message, organizationId, and userId are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // ── 1. Session management ───────────────────────────────────────────
    let activeSessionId = sessionId;

    if (!activeSessionId) {
      const { data: newSession, error: sessionError } = await supabase
        .from('sessions')
        .insert({
          organization_id: organizationId,
          user_id: userId,
          track_id: trackId,
          status: 'active',
          started_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (sessionError || !newSession) {
        console.error('Failed to create session:', sessionError);
        return Response.json(
          { error: 'Failed to create session' },
          { status: 500 }
        );
      }

      activeSessionId = newSession.id;
    }

    // ── 2. Save user message (skip for session start signal) ──────────
    const isSessionStart = message === '__START_SESSION__';

    if (!isSessionStart) {
      const { error: msgError } = await supabase
        .from('messages')
        .insert({
          session_id: activeSessionId,
          organization_id: organizationId,
          role: 'user',
          content: message,
          metadata: {},
          has_files: false,
        })
        .select('id')
        .single();

      if (msgError) {
        console.error('Failed to save user message:', msgError);
        return Response.json(
          { error: 'Failed to save message' },
          { status: 500 }
        );
      }
    }

    // ── 3. Load track with blocks and fields ────────────────────────────
    const { data: track, error: trackError } = await supabase
      .from('tracks')
      .select(`
        *,
        schema_blocks (
          *,
          schema_fields (*)
        )
      `)
      .eq('id', trackId)
      .single();

    if (trackError || !track) {
      console.error('Failed to load track:', trackError);
      return Response.json({ error: 'Track not found' }, { status: 404 });
    }

    // ── 4. Load extraction instances for accumulated knowledge ──────────
    const blockIds = (track.schema_blocks ?? []).map(
      (b: { id: string }) => b.id
    );

    let instances: Array<{
      instance_label: string;
      data: Record<string, unknown>;
      block_name?: string;
    }> = [];

    if (blockIds.length > 0) {
      const { data: rawInstances } = await supabase
        .from('extraction_instances')
        .select('instance_label, data, block_id')
        .eq('organization_id', organizationId)
        .in('block_id', blockIds);

      if (rawInstances) {
        const blockMap = new Map(
          (track.schema_blocks ?? []).map((b: { id: string; name: string }) => [
            b.id,
            b.name,
          ])
        );
        instances = rawInstances.map((inst) => ({
          instance_label: inst.instance_label,
          data: inst.data as Record<string, unknown>,
          block_name: (blockMap.get(inst.block_id) as string | undefined) ?? undefined,
        }));
      }
    }

    // ── 5. Load last session info for context ───────────────────────────
    const { data: lastSession } = await supabase
      .from('sessions')
      .select('created_at, summary')
      .eq('track_id', trackId)
      .eq('user_id', userId)
      .neq('id', activeSessionId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Count current session number
    const { count: sessionCount } = await supabase
      .from('sessions')
      .select('*', { count: 'exact', head: true })
      .eq('track_id', trackId)
      .eq('user_id', userId);

    const sessionNumber = sessionCount ?? 1;

    // ── 6. Load injected questions ──────────────────────────────────────
    const { data: injectedQuestions } = await supabase
      .from('injected_questions')
      .select('question, priority, context')
      .eq('track_id', trackId)
      .eq('organization_id', organizationId)
      .eq('status', 'pending')
      .order('priority', { ascending: false });

    // ── 7. Build 4-layer system prompt ──────────────────────────────────
    // Layer 1: Base prompt based on conversation style
    const basePrompt =
      track.conversation_style === 'open_ended'
        ? buildTrackABasePrompt()
        : buildTrackBBasePrompt();

    // Layer 2: Schema context — use the first block with empty fields, or first block
    interface BlockRow {
      id: string;
      name: string;
      code: string;
      display_order: number;
      schema_fields: Array<{
        name: string;
        code: string;
        field_type: string;
        description: string | null;
        question_hint: string | null;
        is_required: boolean;
        is_bot_critical: boolean;
        display_order: number;
      }>;
    }

    const sortedBlocks = ((track.schema_blocks ?? []) as BlockRow[]).sort(
      (a, b) => a.display_order - b.display_order
    );

    let schemaContextStr = '';
    if (sortedBlocks.length > 0) {
      // Find current block — first one that has unfilled fields, fallback to first
      const currentBlock =
        sortedBlocks.find((block) => {
          const blockInstance = instances.find(
            (inst) => inst.block_name === block.name
          );
          if (!blockInstance) return true; // no data yet
          const filledCount = Object.values(blockInstance.data).filter(
            (v) => v != null
          ).length;
          return filledCount < (block.schema_fields ?? []).length;
        }) ?? sortedBlocks[0];

      const blockInstance = instances.find(
        (inst) => inst.block_name === currentBlock.name
      );

      const fields: SchemaFieldForPrompt[] = (
        currentBlock.schema_fields ?? []
      )
        .sort((a, b) => a.display_order - b.display_order)
        .map((f) => ({
            name: f.name,
            code: f.code,
            field_type: f.field_type,
            description: f.description,
            question_hint: f.question_hint,
            is_required: f.is_required,
            is_bot_critical: f.is_bot_critical,
            value: blockInstance?.data?.[f.code] ?? undefined,
          })
        );

      const filledCount = fields.filter((f) => f.value != null).length;
      const completeness =
        fields.length > 0
          ? Math.round((filledCount / fields.length) * 100)
          : 0;

      schemaContextStr = buildSchemaContext(
        currentBlock.name,
        fields,
        completeness
      );
    }

    // Layer 3: Accumulated knowledge
    const knowledgeStr = buildAccumulatedKnowledge(instances);

    // Layer 4: Session context
    const sessionContextStr = buildSessionContext(
      sessionNumber,
      lastSession?.created_at ?? undefined,
      lastSession?.summary ?? undefined,
      (injectedQuestions as Array<{
        question: string;
        priority: string;
        context?: string | null;
      }>) ?? undefined
    );

    // Language instruction
    const langNames: Record<string, string> = { en: 'English', bg: 'Bulgarian', es: 'Spanish' };
    const langInstruction = language && language !== 'en'
      ? `\n\nIMPORTANT: Respond to the user in ${langNames[language] || 'English'}. All your messages must be written in ${langNames[language] || 'English'}.`
      : '';

    const systemPrompt = [
      basePrompt,
      schemaContextStr,
      knowledgeStr,
      sessionContextStr,
      langInstruction,
    ]
      .filter(Boolean)
      .join('\n\n');

    // ── 8. Load conversation history ────────────────────────────────────
    const { data: historyRows } = await supabase
      .from('messages')
      .select('role, content')
      .eq('session_id', activeSessionId)
      .order('created_at', { ascending: true });

    let conversationMessages = (historyRows ?? []).map(
      (m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })
    );

    // For session start, ensure we have at least one user message for Claude
    if (isSessionStart || conversationMessages.length === 0) {
      conversationMessages = [
        {
          role: 'user' as const,
          content: 'Hello, let\'s begin the knowledge extraction session.',
        },
      ];
    }

    // ── 9. Stream response via SSE ──────────────────────────────────────
    const encoder = new TextEncoder();
    let fullResponse = '';

    const readable = new ReadableStream({
      async start(controller) {
        try {
          const stream = anthropic.messages.stream({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 4096,
            system: systemPrompt,
            messages: conversationMessages,
          });

          stream.on('text', (text) => {
            fullResponse += text;
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: 'text', text })}\n\n`
              )
            );
          });

          stream.on('finalMessage', async () => {
            // ── 10. Save assistant message ──────────────────────────────
            const { data: assistantMsg } = await supabase
              .from('messages')
              .insert({
                session_id: activeSessionId,
                organization_id: organizationId,
                role: 'assistant',
                content: fullResponse,
                metadata: {},
                has_files: false,
              })
              .select('id')
              .single();

            const assistantMessageId = assistantMsg?.id ?? null;

            // Send done event with sessionId and messageId
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: 'done',
                  sessionId: activeSessionId,
                  messageId: assistantMessageId,
                })}\n\n`
              )
            );
            controller.close();

            // ── 11. Fire-and-forget extraction (skip for session start) ──
            if (isSessionStart) {
              return; // No user content to extract from
            }
            const baseUrl =
              process.env.NEXT_PUBLIC_APP_URL ??
              (process.env.VERCEL_URL
                ? `https://${process.env.VERCEL_URL}`
                : 'http://localhost:3000');

            try {
              fetch(`${baseUrl}/api/kea/extract`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  sessionId: activeSessionId,
                  organizationId,
                  trackId,
                  latestMessages: [
                    { role: 'user', content: message },
                    { role: 'assistant', content: fullResponse },
                  ],
                }),
              }).catch((err) =>
                console.error('Background extraction failed:', err)
              );
            } catch {
              // Silently ignore — extraction is best-effort
            }
          });

          stream.on('error', (err) => {
            console.error('Claude stream error:', err);
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: 'error',
                  error: String(err),
                })}\n\n`
              )
            );
            controller.close();
          });
        } catch (err) {
          console.error('Stream setup error:', err);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: 'error',
                error: String(err),
              })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
