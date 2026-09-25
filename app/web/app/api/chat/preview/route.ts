import { NextResponse } from "next/server";
import { z } from "zod";
import { answerWithGroq, summarizeWithGroq } from "@/utils/chat/groq";
import { callMcp } from "@/utils/chat/mcp-client";
import { summarizeToolResult } from "@/utils/chat/summarize";
import { classifyMessage, toolForIntent } from "@/utils/chat/tool-router";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const requestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(1000),
      }),
    )
    .min(1)
    .max(12),
});

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "A valid message is required." }, { status: 400 });
  }

  const messages = parsed.data.messages;
  const latestMessage = messages.at(-1)?.content ?? "";
  const tool = toolForIntent(classifyMessage(latestMessage));

  try {
    const catalogContext = tool
      ? await callMcp(tool).then((result) => summarizeToolResult(tool.name, result))
      : undefined;
    const reply = await answerWithGroq(messages, catalogContext);
    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json(
      { error: "The assistant is temporarily unavailable." },
      { status: 502 },
    );
  }
}

export async function PUT(request: Request) {
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "A valid conversation is required." }, { status: 400 });
  }

  try {
    return NextResponse.json({ summary: await summarizeWithGroq(parsed.data.messages) });
  } catch {
    return NextResponse.json(
      { error: "The conversation could not be prepared for full chat." },
      { status: 502 },
    );
  }
}
