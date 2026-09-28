import type { McpResponse, ToolCall } from "./types";

const mcpServerUrl = process.env.MCP_SERVER_URL ?? "http://127.0.0.1:8000/mcp";

export async function callMcp(tool: ToolCall, apiKey?: string) {
  const response = await fetch(mcpServerUrl, {
    method: "POST",
    headers: {
      Accept: "application/json, text/event-stream",
      "Content-Type": "application/json",
      "MCP-Protocol-Version": "2025-06-18",
      ...(apiKey ? { "x-api-key": apiKey } : {}),
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: { name: tool.name, arguments: tool.args },
    }),
    signal: AbortSignal.timeout(8000),
  });
  const payload = (await response.json().catch(() => ({}))) as McpResponse;

  if (!response.ok || payload.error) {
    throw new Error(payload.error?.message ?? `MCP request failed (${response.status})`);
  }

  return payload.result?.content?.find((item) => item.type === "text")?.text ?? "";
}
