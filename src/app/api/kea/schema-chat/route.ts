import Anthropic from '@anthropic-ai/sdk';
import { SCHEMA_AGENT_SYSTEM_PROMPT } from '@/lib/kea/ai/schema-agent-prompt';

const anthropic = new Anthropic();

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { messages, organizationContext } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return Response.json({ error: 'Messages array required' }, { status: 400 });
    }

    let systemPrompt = SCHEMA_AGENT_SYSTEM_PROMPT;
    if (organizationContext) {
      systemPrompt += `\n\nORGANIZATION CONTEXT:\n- Name: ${organizationContext.name}\n- Industry: ${organizationContext.industry}\n- Language: ${organizationContext.language}\n`;
    }

    const claudeMessages = messages.map((msg: { role: string; content: string }) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          const stream = anthropic.messages.stream({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 8192,
            system: systemPrompt,
            messages: claudeMessages,
          });

          stream.on('text', (text) => {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'text', text })}\n\n`)
            );
          });

          stream.on('finalMessage', () => {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`)
            );
            controller.close();
          });

          stream.on('error', (err) => {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: 'error', error: String(err) })}\n\n`
              )
            );
            controller.close();
          });
        } catch (err) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: 'error', error: String(err) })}\n\n`
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
    console.error('Schema chat error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
