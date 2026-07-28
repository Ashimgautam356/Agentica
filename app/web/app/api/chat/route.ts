import { NextResponse } from "next/server";
import { answerWithGemini } from "@/utils/chat/gemini";
import { callMcp } from "@/utils/chat/mcp-client";
import { summarizeToolResult } from "@/utils/chat/summarize";
import { classifyMessage, toolForIntent } from "@/utils/chat/tool-router";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json()) as { message?: string };
  const message = body.message?.trim();

  if (!message) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  try {
    const intent = classifyMessage(message);
    const tool = toolForIntent(intent);
    const rawToolResult = tool ? await callMcp(tool) : "";
    const fallbackReply = tool
      ? summarizeToolResult(tool.name, rawToolResult)
      : fallbackReplyForIntent(intent.type);
    const reply = await answerWithGemini({
      fallbackReply,
      intent,
      message,
      ...(tool ? { tool, toolResult: rawToolResult } : {}),
    });

    return NextResponse.json({
      tool: tool?.name,
      reply,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to reach the MCP server or backend API",
      },
      { status: 500 },
    );
  }
}

function fallbackReplyForIntent(intent: string) {
  if (intent === "site_help") {
    return "You can use this site by chatting about what you need, browsing categories, or asking for help when you feel unsure.";
  }

  return "No rush. You can tell me what you are looking for, ask how the site works, or just browse around.";
}
