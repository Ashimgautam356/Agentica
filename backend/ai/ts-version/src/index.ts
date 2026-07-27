#!/usr/bin/env node

import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "agentica-mcp-server",
  version: "0.1.0",
});

const backendUrl = process.env.BACKEND_API_URL ?? "http://localhost:4000";

async function callBackend(path: string) {
  const response = await fetch(`${backendUrl}${path}`);
  const text = await response.text();

  if (!response.ok) {
    throw new Error(`Backend request failed: ${response.status} ${text}`);
  }

  return JSON.parse(text) as unknown;
}

function jsonContent(data: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}

server.registerResource(
  "server-info",
  new ResourceTemplate("server://info", { list: undefined }),
  {
    title: "Server Info",
    description: "Basic information about the Agentica MCP server.",
    mimeType: "application/json",
  },
  async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: "application/json",
        text: JSON.stringify(
          {
            name: "agentica-mcp-server",
            version: "0.1.0",
            capabilities: ["resources", "tools"],
          },
          null,
          2,
        ),
      },
    ],
  }),
);

server.registerTool(
  "echo",
  {
    title: "Echo",
    description: "Return the provided message. Useful for testing the MCP connection.",
    inputSchema: {
      message: z.string().min(1).describe("Message to echo back."),
    },
  },
  async ({ message }) => ({
    content: [
      {
        type: "text",
        text: message,
      },
    ],
  }),
);

server.registerTool(
  "list_products",
  {
    title: "List Products",
    description: "Fetch products from the Express backend public API.",
    inputSchema: {},
  },
  async () => jsonContent(await callBackend("/api/products")),
);

server.registerTool(
  "get_product",
  {
    title: "Get Product",
    description: "Fetch one product by id from the Express backend public API.",
    inputSchema: {
      id: z.string().min(1).describe("Product id."),
    },
  },
  async ({ id }) => jsonContent(await callBackend(`/api/products/${encodeURIComponent(id)}`)),
);

server.registerTool(
  "list_categories",
  {
    title: "List Categories",
    description: "Fetch categories from the Express backend public API.",
    inputSchema: {},
  },
  async () => jsonContent(await callBackend("/api/categories")),
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Agentica MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in MCP server:", error);
  process.exit(1);
});
