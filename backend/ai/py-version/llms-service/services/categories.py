from auth import require_api_key
from backend_client import make_backend_request
from server import mcp


@mcp.tool()
@require_api_key
async def list_categories() -> str:
    """Fetch categories from the Express backend public API."""
    data = await make_backend_request("/api/categories")
    if data is None:
        return "Unable to fetch categories."
    return str(data)
