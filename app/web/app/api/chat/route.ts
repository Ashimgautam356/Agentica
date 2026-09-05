import { NextResponse } from "next/server";
import { z } from "zod";
import { answerWithGroq } from "@/utils/chat/groq";
import { callMcp } from "@/utils/chat/mcp-client";
import { productPreviews, summarizeToolResult } from "@/utils/chat/summarize";
import { classifyMessage, toolForIntent } from "@/utils/chat/tool-router";
import type { ProductPreview } from "@/utils/chat/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const requestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(4000),
      }),
    )
    .min(1)
    .max(30),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "A valid conversation is required." }, { status: 400 });
  }

  const lastMessage = parsed.data.messages.at(-1);
  if (lastMessage?.role !== "user") {
    return NextResponse.json({ error: "The last message must be from the user." }, { status: 400 });
  }

  try {
    const tool = toolForIntent(classifyMessage(lastMessage.content));
    let catalogContext: string | undefined;
    let products: ProductPreview[] = [];

    if (tool) {
      try {
        const result = await callMcp(tool);
        catalogContext = summarizeToolResult(tool.name, result);
        products = productPreviews(tool.name, result);
      } catch {
        catalogContext =
          "The live catalog is temporarily unavailable. Say so if the user asks for specific products or categories.";
      }
    }

    const reply = await answerWithGroq(parsed.data.messages, catalogContext);
    return NextResponse.json({ reply, tool: tool?.name, products });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "The assistant is temporarily unavailable.",
      },
      { status: 502 },
    );
  }
}
