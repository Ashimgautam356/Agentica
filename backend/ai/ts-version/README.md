# Agentica MCP Server

Simple TypeScript MCP server using stdio transport.

This server calls the Express backend over HTTP. Start `backend/express` first, or set
`BACKEND_API_URL` to the backend URL.

## Setup

```bash
pnpm install
pnpm build
```

## Run

```bash
pnpm start
```

For MCP clients, point the command at the built server:

```json
{
  "mcpServers": {
    "agentica": {
      "command": "node",
      "args": ["/home/ashim/Desktop/ScanWise/backend/ai/ts-version/dist/index.js"]
    }
  }
}
```

## Capabilities

- Resource: `server://info`
- Tool: `echo`
- Tool: `list_products`
- Tool: `get_product`
- Tool: `list_categories`

For stdio MCP servers, keep logs on stderr. Writing regular logs to stdout can corrupt JSON-RPC messages.
