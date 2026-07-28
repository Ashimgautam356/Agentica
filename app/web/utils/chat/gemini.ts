import { GoogleGenAI } from "@google/genai";
import type { ChatIntent, ToolCall } from "./types";

type GeminiInput = {
  fallbackReply: string;
  intent: ChatIntent;
  message: string;
  tool?: ToolCall;
  toolResult?: string;
};

export async function answerWithGemini(input: GeminiInput) {
  const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return input.fallbackReply;
  }

  const ai = new GoogleGenAI({ apiKey });
  const interaction = await ai.interactions.create({
    model: process.env.GEMINI_MODEL ?? "gemini-3.6-flash",
    input: buildPrompt(input),
  });

  return interaction.output_text?.trim() || input.fallbackReply;
}

function buildPrompt({ fallbackReply, intent, message, tool, toolResult }: GeminiInput) {
  return `You are the friendly helper for Agentica.

How to behave:
- Be warm, calm, and natural.
- Sound like a helpful person, not a salesperson.
- Do not pressure the user to buy anything.
- Do not overuse sales phrases like "perfect for you", "best deal", "must-have", or "shop now".
- Do not introduce yourself by name unless the user explicitly asks who you are.
- Do not repeat the name Agentica in normal follow-up replies.
- First chat with the user. Do not list products unless the user shows shopping intent.
- If the user asks how the site works, explain the shopping flow in simple words.
- If the user shows interest in a category or product type, use catalog data to help them explore without pushing.
- Ask at most one gentle follow-up question, and only when it genuinely helps.
- If the user is casual or unsure, reassure them that they can browse slowly.
- Use only MCP data as truth for actual products/categories.
- Do not invent products, prices, or categories.

User message:
${message}

Detected intent:
${intent.type}${"interest" in intent && intent.interest ? ` (${intent.interest})` : ""}

MCP tool used:
${tool?.name ?? "none"}

Raw MCP result:
${toolResult ?? "none"}

Plain fallback reply:
${fallbackReply}

Reply in 1-4 short sentences. Keep it easygoing.`;
}
