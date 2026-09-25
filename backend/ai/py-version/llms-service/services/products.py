from urllib.parse import urlencode

from auth import require_api_key
from backend_client import make_backend_request
from server import mcp
from validation import is_valid_uuid


@mcp.tool()
@require_api_key
async def list_products(
    search: str | None = None,
    category_id: str | None = None,
    max_price: float | None = None,
    min_rating: float | None = None,
) -> str:
    """Fetch products from the Express backend, optionally filtered.

    Args:
        search: Optional text to search for in product names/tags.
        category_id: Optional category id to filter by.
        max_price: Optional maximum price.
        min_rating: Optional minimum average rating (0-5).
    """
    if category_id and not is_valid_uuid(category_id):
        return "Invalid category id — must be a valid UUID."

    params = {}
    if search:
        params["search"] = search
    if category_id:
        params["categoryId"] = category_id
    if max_price is not None:
        params["maxPrice"] = max_price
    if min_rating is not None:
        params["minRating"] = min_rating

    path = "/api/products"
    if params:
        path += f"?{urlencode(params)}"

    data = await make_backend_request(path)
    if data is None:
        return "Unable to fetch products."
    return str(data)


@mcp.tool()
@require_api_key
async def get_top_rated_products(limit: int = 10, min_rating: float = 4.0) -> str:
    """Fetch the best-reviewed products, sorted from highest to lowest
    average rating. Each product includes its averageRating and
    reviewCount.

    Args:
        limit: Max number of products to return (default 10).
        min_rating: Only include products with at least this average
            rating, 0-5 (default 4.0).
    """
    if not 0 <= min_rating <= 5:
        return "min_rating must be between 0 and 5."
    if not 1 <= limit <= 100:
        return "limit must be between 1 and 100."

    path = f"/api/products?{urlencode({'minRating': min_rating, 'pageSize': 100})}"
    data = await make_backend_request(path)
    if data is None:
        return "Unable to fetch products."

    products = data.get("data") if isinstance(data, dict) else data
    if not isinstance(products, list):
        return str(data)

    top = sorted(products, key=lambda p: p.get("averageRating", 0), reverse=True)[:limit]
    return str(top)


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
