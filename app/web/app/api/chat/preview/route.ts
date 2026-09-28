import { NextResponse } from "next/server";
import { z } from "zod";
import { answerWithGroq, summarizeWithGroq } from "@/utils/chat/groq";

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

  try {
    const reply = await answerWithGroq(messages);
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
