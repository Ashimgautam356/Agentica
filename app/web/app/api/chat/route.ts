import { NextResponse } from "next/server";
import { z } from "zod";
import { callMcp } from "@/utils/chat/mcp-client";
import { productPreviews } from "@/utils/chat/summarize";
import { classifyMessage, toolForIntent } from "@/utils/chat/tool-router";
import type { ProductPreview, StoredChatMessage } from "@/utils/chat/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const sessionIdSchema = z.uuid();
const requestSchema = z.object({
  sessionId: sessionIdSchema,
  content: z.string().trim().min(1).max(4000),
  handoffSummary: z.string().trim().min(1).max(4000).optional(),
});

type BackendResponse<T> = {
  success?: boolean;
  data?: T;
  error?: { message?: string };
};

function backendUrl(path: string) {
  const base =
    process.env.BACKEND_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
  return `${base.replace(/\/$/, "").replace(/\/api$/, "")}/api${path}`;
}

function forwardedAuthHeaders(request: Request) {
  const headers = new Headers({ "Content-Type": "application/json" });
  for (const name of ["authorization", "cookie", "x-api-key"]) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  return headers;
}

async function readBackendResponse<T>(response: Response) {
  const body = (await response.json().catch(() => ({}))) as BackendResponse<T>;
  if (!response.ok || !body.data) {
    return {
      error: NextResponse.json(
        { error: body.error?.message ?? "The assistant is temporarily unavailable." },
        { status: response.status || 502 },
      ),
    };
  }
  return { data: body.data };
}

export async function GET(request: Request) {
  const sessionId = sessionIdSchema.safeParse(new URL(request.url).searchParams.get("sessionId"));
  if (!sessionId.success) {
    return NextResponse.json({ error: "A valid chat session is required." }, { status: 400 });
  }

  try {
    const response = await fetch(backendUrl(`/chat/${sessionId.data}`), {
      headers: forwardedAuthHeaders(request),
      cache: "no-store",
    });
    const result = await readBackendResponse<{ messages: StoredChatMessage[] }>(response);
    if (result.error) return result.error;
    return NextResponse.json({ messages: result.data!.messages });
  } catch {
    return NextResponse.json({ error: "The conversation could not be restored." }, { status: 502 });
  }
}

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "A valid message and chat session are required." },
      { status: 400 },
    );
  }

  const { content, handoffSummary, sessionId } = parsed.data;
  const tool = toolForIntent(classifyMessage(content));
  const catalogPromise: Promise<ProductPreview[]> = tool
    ? callMcp(tool)
        .then((result) => productPreviews(tool.name, result))
        .catch(() => [])
    : Promise.resolve([]);
  const chatPromise = fetch(backendUrl(`/chat/${sessionId}/message`), {
    method: "POST",
    headers: forwardedAuthHeaders(request),
    body: JSON.stringify({ content, handoffSummary }),
    cache: "no-store",
  });

  try {
    const [response, products] = await Promise.all([chatPromise, catalogPromise]);
    const result = await readBackendResponse<{
      userMessage: StoredChatMessage;
      assistantMessage: StoredChatMessage;
    }>(response);
    if (result.error) return result.error;

    return NextResponse.json({
      message: result.data!.assistantMessage,
      reply: result.data!.assistantMessage.content,
      tool: tool?.name,
      products,
    });
  } catch {
    return NextResponse.json(
      { error: "The assistant is temporarily unavailable." },
      { status: 502 },
    );
  }
}
