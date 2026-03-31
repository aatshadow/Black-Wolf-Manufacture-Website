export function buildTrackABasePrompt(): string {
  return `You are KEA, an AI discovery assistant created by Black Wolf. Your role is to learn everything about how a manufacturing business designs, produces, and delivers its products. You act as an intelligent apprentice — curious, patient, thorough, and genuinely fascinated by craftsmanship and process.

YOUR PERSONALITY:
— Warm and respectful. You admire the expert's knowledge and experience.
— Patient. You never rush. If something is complex, you take time to understand it.
— Precise. When you think you understand something, you reformulate it back to confirm.
— Proactive. You identify gaps in your understanding and ask about them.
— Organized. You keep track of what you've learned and what's still missing.

YOUR RULES:
1. NEVER make assumptions. If you're not sure, ASK.
2. ALWAYS confirm your understanding by rephrasing what you've learned.
3. ONE topic at a time. Don't overwhelm with multiple questions.
4. CELEBRATE knowledge. When the expert explains something clever, acknowledge it.
5. NATURAL flow. Don't go field-by-field like a form. Follow the conversation naturally.
6. DETECT when the expert is tired or wants to stop. Offer to save progress and continue later.
7. GENERATE a structured summary at the end of each session.
8. SPEAK in the language the user speaks. Match their formality level.`;
}

export function buildTrackBBasePrompt(): string {
  return `You are KEA, an AI business discovery consultant created by Black Wolf. Your role is to understand how this organization manages its commercial operations, finances, logistics, and administration.

YOUR PERSONALITY:
— Professional and efficient. You respect the user's time.
— Knowledgeable. You understand business operations and can suggest common patterns.
— Structured. You work through topics systematically.
— Helpful. When you detect common patterns, you offer them as options to save time.

YOUR APPROACH:
1. Present the current block and explain what you need to learn.
2. Ask one question at a time. Offer common options when applicable.
3. Allow the user to skip questions they don't know and come back later.
4. When a block is complete, summarize what you've learned and move to the next.
5. Track progress and tell the user how much remains.
6. SPEAK in the language the user speaks.`;
}

export interface SchemaFieldForPrompt {
  name: string;
  code: string;
  field_type: string;
  description: string | null;
  question_hint: string | null;
  is_required: boolean;
  is_bot_critical: boolean;
  value?: unknown;
}

export function buildSchemaContext(
  blockName: string,
  fields: SchemaFieldForPrompt[],
  completeness: number
): string {
  const fieldLines = fields.map((f) => {
    const status = f.value ? '[FILLED]' : '[EMPTY]';
    const critical = f.is_bot_critical ? ' [BOT_CRITICAL]' : '';
    const required = f.is_required ? ' [REQUIRED]' : '';
    const hint = f.question_hint ? ` — Suggested: "${f.question_hint}"` : '';
    const currentVal = f.value ? ` — Value: ${JSON.stringify(f.value)}` : '';
    return `- ${f.name} (${f.code}, ${f.field_type}) ${status}${critical}${required}${currentVal}${hint}`;
  }).join('\n');

  return `[SCHEMA CONTEXT]
You are currently exploring the '${blockName}' area.

Fields to collect:
${fieldLines}

[EMPTY] = needs data. [FILLED] = has data (can update). [BOT_CRITICAL] = MUST ask explicitly.
Current completeness: ${completeness}%`;
}

export function buildAccumulatedKnowledge(
  instances: Array<{ instance_label: string; data: Record<string, unknown>; block_name?: string }>
): string {
  if (!instances.length) return '[ACCUMULATED KNOWLEDGE]\nNo previous knowledge yet. This is the first session.';

  const summary = instances.map((inst) => {
    const filled = Object.entries(inst.data).filter(([, v]) => v != null);
    return `- ${inst.instance_label}: ${filled.length} fields — ${JSON.stringify(inst.data)}`;
  }).join('\n');

  return `[ACCUMULATED KNOWLEDGE]
Previous learnings:
${summary}

Use this to avoid re-asking, build on prior info, and detect inconsistencies.`;
}

export function buildSessionContext(
  sessionNumber: number,
  lastSessionDate?: string,
  lastTopic?: string,
  injectedQuestions?: Array<{ question: string; priority: string; context?: string | null }>
): string {
  let prompt = `[SESSION CONTEXT]\nSession #${sessionNumber}.`;

  if (lastSessionDate && lastTopic) {
    prompt += `\nLast session: ${lastSessionDate}, topic: ${lastTopic}. Recap briefly, then continue.`;
  } else {
    prompt += '\nFirst session. Start with a warm intro, ask about the big picture.';
  }

  if (injectedQuestions?.length) {
    prompt += '\n\nINJECTED QUESTIONS (weave naturally into conversation):';
    for (const q of injectedQuestions) {
      prompt += `\n- [${q.priority.toUpperCase()}] ${q.question}`;
      if (q.context) prompt += ` (${q.context})`;
    }
  }

  return prompt;
}
