from backend_client import (
    format_tool_response,
    handle_backend_errors,
    make_backend_request,
)
from server import mcp


@mcp.tool()
@handle_backend_errors
async def list_categories() -> str:
    """Fetch categories from the Express backend public API."""
    data = await make_backend_request("/api/categories")
    return format_tool_response(data)
