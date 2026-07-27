import type { McpResponse, ToolCall } from "./types";

const mcpServerPath =
  process.env.MCP_SERVER_PATH ?? `${process.cwd()}/../../backend/ai/ts-version/dist/index.js`;

export async function callMcp(tool: ToolCall) {
  const { spawn } = await import("node:child_process");
  const args: string[] = [];
  args.push(mcpServerPath);
  const child = spawn("node", args, {
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
