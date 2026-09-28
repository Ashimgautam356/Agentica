from mcp.server.transport_security import TransportSecuritySettings

from config import HOST, MCP_ALLOWED_HOSTS, MCP_ALLOWED_ORIGINS, MCP_TRANSPORT, PORT
from server import mcp

# Importing these modules is what actually registers their @mcp.tool()
# functions onto the shared server — each import below has a side effect,
# even though nothing from them is used directly in this file.
from services import categories, orders, products, search  # noqa: F401

transport_security = TransportSecuritySettings(
    allowed_hosts=MCP_ALLOWED_HOSTS,
    allowed_origins=MCP_ALLOWED_ORIGINS,
)

# Vercel imports this ASGI application instead of starting a persistent server.
app = mcp.streamable_http_app(
    streamable_http_path="/mcp",
    stateless_http=True,
    json_response=True,
    transport_security=transport_security,
    host=HOST,
)


def main():
    if MCP_TRANSPORT == "stdio":
        mcp.run(transport="stdio")
        return

    if MCP_TRANSPORT != "streamable-http":
        raise ValueError("MCP_TRANSPORT must be 'stdio' or 'streamable-http'.")

    mcp.run(
        transport="streamable-http",
        host=HOST,
        port=PORT,
        streamable_http_path="/mcp",
        stateless_http=True,
        json_response=True,
        transport_security=transport_security,
    )


if __name__ == "__main__":
    main()
