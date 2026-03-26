import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { AGENT_SYSTEM_PROMPT } from "@/lib/agent-system-prompt";
import { supabase } from "@/lib/supabase";

const BLACKWOLF_CLIENT_ID = process.env.BLACKWOLF_CLIENT_ID!;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { message, history, lang, conversationId } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Build conversation messages from history
    const messages: Anthropic.MessageParam[] = [];

    if (history && Array.isArray(history)) {
      for (const msg of history) {
        if (msg.role === "user" || msg.role === "assistant") {
          messages.push({
            role: msg.role,
            content: msg.content,
          });
        }
      }
    }

    // Ensure last message is the user's current message
    if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
      messages.push({ role: "user", content: message });
    }

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 400,
      system: `${AGENT_SYSTEM_PROMPT}\n\nThe user's detected browser language is: ${lang || "en"}. Respond in that language unless the user writes in a different one — then match theirs.\n\nIMPORTANT: Adapt your message length to the context. Short answers for simple questions (1-2 sentences). Longer when explaining services, processes, or success stories (but still max 4-5 sentences). Never pad messages with filler.`,
      messages,
    });

    const reply =
      response.content[0].type === "text"
        ? response.content[0].text
        : "Sorry, I couldn't process that. Can you try again?";

    // Save conversation to Supabase
    let newConversationId = conversationId;
    try {
      const savedId = await saveToSupabase(message, reply, conversationId, lang);
      if (savedId) newConversationId = savedId;
    } catch (err) {
      console.error("Failed to save chat:", err);
    }

    return NextResponse.json({ reply, conversationId: newConversationId || undefined });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to get response" },
      { status: 500 }
    );
  }
}

async function saveToSupabase(
  userMessage: string,
  assistantReply: string,
  conversationId: string | null,
  lang: string
) {
  let convId = conversationId;

  // Create conversation if new
  if (!convId) {
    const { data } = await supabase
      .from("chat_conversations")
      .insert({
        client_id: BLACKWOLF_CLIENT_ID,
        channel: "website_ai",
        status: "active",
        last_message: userMessage.slice(0, 200),
        last_message_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (data) convId = data.id;
  } else {
    // Update last message
    await supabase
      .from("chat_conversations")
      .update({
        last_message: userMessage.slice(0, 200),
        last_message_at: new Date().toISOString(),
      })
      .eq("id", convId);
  }

  if (!convId) return;

  // Save both messages
  await supabase.from("chat_messages").insert([
    {
      client_id: BLACKWOLF_CLIENT_ID,
      conversation_id: convId,
      sender_type: "contact",
      content: userMessage,
      message_type: "text",
      metadata: { lang, source: "website_ai_widget" },
    },
    {
      client_id: BLACKWOLF_CLIENT_ID,
      conversation_id: convId,
      sender_type: "agent",
      content: assistantReply,
      message_type: "text",
      metadata: { lang, source: "website_ai_widget", model: "claude-sonnet-4" },
    },
  ]);

  return convId;
}
