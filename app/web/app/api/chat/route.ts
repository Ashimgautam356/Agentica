import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type McpResponse = {
  id?: number;
  result?: {
    content?: Array<{ type: string; text?: string }>;
  };
  error?: { message?: string };
};

type ToolCall = {
  name: string;
  args: Record<string, string>;
};

const mcpServerPath =
  process.env.MCP_SERVER_PATH ??
  resolve(process.cwd(), "../../backend/ai/ts-version/dist/index.js");

function chooseTool(message: string): ToolCall {
  const text = message.toLowerCase();
  const id = message.match(/\b(?:product|id)\s+([a-zA-Z0-9_-]+)/)?.[1];

  if (text.startsWith("echo ")) {
    return { name: "echo", args: { message: message.slice(5).trim() } };
  }

  if (id) {
    return { name: "get_product", args: { id } };
  }

  if (text.includes("categor")) {
    return { name: "list_categories", args: {} };
  }

  return { name: "list_products", args: {} };
}

function summarize(tool: string, rawText: string) {
  try {
    const parsed = JSON.parse(rawText) as { data?: unknown };
    const data = parsed.data;

    if (Array.isArray(data)) {
      if (data.length === 0) {
        return `No ${tool.includes("categor") ? "categories" : "products"} found.`;
      }

      return data
        .slice(0, 6)
        .map((item) => {
          if (item && typeof item === "object") {
            const record = item as Record<string, unknown>;
            return `- ${String(record.name ?? record.title ?? record.id ?? "Item")}`;
          }

          return `- ${String(item)}`;
        })
        .join("\n");
    }

    return JSON.stringify(data ?? parsed, null, 2);
  } catch {
    return rawText;
  }
}

async function callMcp(tool: ToolCall) {
  const child = spawn("node", [mcpServerPath], {
    cwd: process.cwd(),
    env: process.env,
    stdio: ["pipe", "pipe", "pipe"],
  });

  let nextId = 1;
  let buffer = "";
  const waiting = new Map<number, (response: McpResponse) => void>();

  const send = (method: string, params: unknown) => {
    const id = nextId++;

    child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id, method, params })}\n`);

    return new Promise<McpResponse>((resolveResponse) => {
      waiting.set(id, resolveResponse);
    });
  };

  child.stdout.on("data", (chunk: Buffer) => {
    buffer += chunk.toString();
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.trim()) {
        continue;
      }

      const response = JSON.parse(line) as McpResponse;
      if (response.id && waiting.has(response.id)) {
        waiting.get(response.id)?.(response);
        waiting.delete(response.id);
      }
    }
  });

  const timer = setTimeout(() => child.kill(), 8000);

  try {
    await send("initialize", {
      protocolVersion: "2025-06-18",
      capabilities: {},
      clientInfo: { name: "agentica-web", version: "0.1.0" },
    });

    child.stdin.write(
      `${JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized", params: {} })}\n`,
    );

    const response = await send("tools/call", {
      name: tool.name,
      arguments: tool.args,
    });

    if (response.error) {
      throw new Error(response.error.message ?? "MCP tool call failed");
    }

    return response.result?.content?.find((item) => item.type === "text")?.text ?? "";
  } finally {
    clearTimeout(timer);
    child.kill();
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) as { message?: string };
  const message = body.message?.trim();

  if (!message) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  try {
    const tool = chooseTool(message);
    const rawText = await callMcp(tool);

    return NextResponse.json({
      tool: tool.name,
      reply: summarize(tool.name, rawText),
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
