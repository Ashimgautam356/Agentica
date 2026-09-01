from auth import require_api_key
from backend_client import make_backend_request
from server import mcp
from validation import is_valid_uuid


@mcp.tool()
@require_api_key
async def list_products() -> str:
    """Fetch products from the Express backend public API."""
    data = await make_backend_request("/api/products")
    if data is None:
        return "Unable to fetch products."
    return str(data)


@mcp.tool()
@require_api_key
async def get_product(id: str) -> str:
    """Fetch one product by id from the Express backend public API.

    Args:
        id: Product id.
    """
    if not is_valid_uuid(id):
        return "Invalid product id — must be a valid UUID."

    data = await make_backend_request(f"/api/products/{id}")
    if data is None:
        return "Unable to fetch product or product not found."
    return str(data)


@mcp.tool()
@require_api_key
async def list_products_by_category(category_id: str) -> str:
    """Fetch all products belonging to a given category id from the public API.

    Args:
        category_id: Category id.
    """
    if not is_valid_uuid(category_id):
        return "Invalid category id — must be a valid UUID."

    data = await make_backend_request(f"/api/categories/{category_id}/products")
    if data is None:
        return "Unable to fetch products for this category."
    return str(data)
