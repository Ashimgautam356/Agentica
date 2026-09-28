# Agentica MCP service

This Python process exposes Agentica shopping operations as MCP tools. It does
not run an LLM itself. It supports local stdio clients and hosted Streamable
HTTP clients while calling the Express API for Agentica data and authentication.

## Setup

```bash
uv sync
```

The Express backend must be running. Configuration is provided through:

- `BACKEND_API_BASE`: Express API origin; defaults to `http://localhost:4000`.
- `CLOUDINARY_CLOUD_NAME`: public Cloudinary cloud name used to add displayable
  image URLs to MCP catalog responses. API keys and secrets are not required.
- `MCP_TRANSPORT`: `stdio` (default) or `streamable-http`.
- `HOST` and `PORT`: bind address for Streamable HTTP.
- `MCP_ALLOWED_HOSTS`: comma-separated hosts accepted by the MCP server.
- `MCP_ALLOWED_ORIGINS`: optional comma-separated browser origins.
- `AGENTICA_API_KEY`: local stdio fallback for protected tools.

Local development values are loaded automatically from `.env`. Copy
`.env.example` when setting up a new checkout.

Public catalog and web-search tools do not require an API key. For Streamable
HTTP, each protected request must send the customer's key using `x-api-key` or
`Authorization: Bearer <key>`. The service forwards the key to Express, which
validates it against the customer record.

Example MCP client configuration:

```json
{
  "command": "uv",
  "args": [
    "--directory",
    "/absolute/path/to/backend/ai/py-version/llms-service",
    "run",
    "main.py"
  ],
  "env": {
    "BACKEND_API_BASE": "http://localhost:4000",
    "CLOUDINARY_CLOUD_NAME": "your-cloud-name",
    "AGENTICA_API_KEY": "your-customer-api-key"
  }
}
```

## Streamable HTTP

Start a local HTTP server:

```bash
uv run main.py
```

The endpoint is `http://127.0.0.1:8000/mcp`. Configure the MCP client to send
one of these headers on every request:

```text
x-api-key: <customer-api-key>
Authorization: Bearer <customer-api-key>
```

For hosting, set `HOST=0.0.0.0`, use the platform-provided `PORT`, and set
`MCP_ALLOWED_HOSTS` and `MCP_ALLOWED_ORIGINS` to the public domain/origins.

## Tools

- Catalog: `list_categories`, `list_products`, `get_product`,
  `get_product_reviews`, `list_products_by_category`, and `get_top_rated_products`.
- Orders: `list_my_orders`, `get_my_order`, and `create_order`.
- Payments: `create_payment`, which uses the backend's card-processing route.
- Search: `search_web`, which returns up to five DuckDuckGo results.

Creating an order or processing a payment requires `confirm=true`. The calling
agent must obtain explicit user confirmation before setting it.

## Checks

```bash
uv run python -m unittest discover
uv run ruff check .
uv run --group dev python -m black --check .
```

## Docker

```bash
docker build -t agentica-mcp .
docker run --rm -p 8000:8000 \
  -e MCP_TRANSPORT=streamable-http \
  -e HOST=0.0.0.0 \
  -e PORT=8000 \
  -e MCP_ALLOWED_HOSTS=localhost:8000 \
  -e BACKEND_API_BASE=http://host.docker.internal:4000 \
  -e CLOUDINARY_CLOUD_NAME=your-cloud-name \
  agentica-mcp
```
