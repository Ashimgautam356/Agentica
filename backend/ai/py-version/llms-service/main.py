from typing import Any

!pip install mcp==2.0.0 httpx

import httpx
from mcp.server.mcpserver import MCPServer

# Initialize MCP server
mcp = MCPServer("agentica")

# Constants
BACKEND_API_BASE = "http://localhost:4000"

async def make_backend_request(
    path: str, method: str = "GET", body: dict | None = None
) -> Any | None:
    """Make a request to the Agentica Express backend with proper error handling."""
    url = f"{BACKEND_API_BASE}{path}"
    async with httpx.AsyncClient() as client:
        try:
            response = await client.request(method, url, json=body, timeout=30.0)
            response.raise_for_status()
            if response.status_code == 204:
                return {"success": True}
            return response.json()
        except Exception:
            return None

def clean(**kwargs: Any) -> dict[str, Any]:
    """Drop keys the caller didn't set before sending a partial update."""
    return {k: v for k, v in kwargs.items() if v is not None}

@mcp.tool()
async def list_products() -> str:
    """Fetch products from the Express backend public API."""
    data = await make_backend_request("/api/products")
    if data is None:
        return "Unable to fetch products."
    return str(data)

@mcp.tool()
async def get_product(id: str) -> str:
    """Fetch one product by id from the Express backend public API.

    Args:
        id: Product id.
    """
    data = await make_backend_request(f"/api/products/{id}")
    if data is None:
        return "Unable to fetch product or product not found."
    return str(data)

@mcp.tool()
async def list_categories() -> str:
    """Fetch categories from the Express backend public API."""
    data = await make_backend_request("/api/categories")
    if data is None:
        return "Unable to fetch categories."
    return str(data)

@mcp.tool()
async def list_products_by_category(category_id: str) -> str:
    """Fetch all products belonging to a given category id from the public API.

    Args:
        category_id: Category id.
    """
    data = await make_backend_request(f"/api/categories/{category_id}/products")
    if data is None:
        return "Unable to fetch products for this category."
    return str(data)

@mcp.tool()
async def list_products_by_category(category_id: str) -> str:
    """Fetch all products belonging to a given category id from the public API.

    Args:
        category_id: Category id.
    """
    data = await make_backend_request(f"/api/categories/{category_id}/products")
    if data is None:
        return "Unable to fetch products for this category."
    return str(data)

@mcp.tool()
async def update_user(
    id: str,
    email: str | None = None,
    first_name: str | None = None,
    last_name: str | None = None,
    image_id: str | None = None,
    age: int | None = None,
    contact: str | None = None,
    address: str | None = None,
) -> str:
    """Update a shopper's own profile fields by user id.

    Args:
        id: User id.
        email: New email address.
        first_name: New first name.
        last_name: New last name.
        image_id: New profile image id.
        age: New age.
        contact: New contact number.
        address: New address.
    """
    body = clean(
        email=email,
        firstName=first_name,
        lastName=last_name,
        imageId=image_id,
        age=age,
        contact=contact,
        address=address,
    )
    data = await make_backend_request(f"/api/users/{id}", method="PATCH", body=body)
    if data is None:
        return "Unable to update user."
    return str(data)

    # admin tools below hit /api/admin/* — assumes the caller is already
# admin-authorized, so if this ever gets exposed to a customer-facing
# agent these need a role check first

@mcp.tool()
async def admin_create_product(
    name: str,
    image_id: str,
    price: float,
    category_id: str,
    image_id_1: str | None = None,
    image_id_2: str | None = None,
    description: list[str] | None = None,
    tags: list[str] | None = None,
) -> str:
    """Create a new product in the catalog.

    Args:
        name: Product name.
        image_id: Primary image id.
        price: Product price.
        category_id: Category id this product belongs to.
        image_id_1: Optional second image id.
        image_id_2: Optional third image id.
        description: List of description paragraphs.
        tags: List of tags.
    """
    body = {
        "name": name,
        "imageId": image_id,
        "price": price,
        "categoryId": category_id,
        "imageId1": image_id_1,
        "imageId2": image_id_2,
        "description": description or [],
        "tags": tags or [],
    }
    data = await make_backend_request("/api/admin/products", method="POST", body=body)
    if data is None:
        return "Unable to create product."
    return str(data)

@mcp.tool()
async def admin_update_product(
    id: str,
    name: str | None = None,
    image_id: str | None = None,
    image_id_1: str | None = None,
    image_id_2: str | None = None,
    description: list[str] | None = None,
    price: float | None = None,
    tags: list[str] | None = None,
    category_id: str | None = None,
) -> str:
    """Update fields on an existing product by id.

    Args:
        id: Product id.
        name: New name.
        image_id: New primary image id.
        image_id_1: New second image id.
        image_id_2: New third image id.
        description: New description paragraphs.
        price: New price.
        tags: New tags.
        category_id: New category id.
    """
    body = clean(
        name=name,
        imageId=image_id,
        imageId1=image_id_1,
        imageId2=image_id_2,
        description=description,
        price=price,
        tags=tags,
        categoryId=category_id,
    )
    data = await make_backend_request(f"/api/admin/products/{id}", method="PATCH", body=body)
    if data is None:
        return "Unable to update product."
    return str(data)

@mcp.tool()
async def admin_create_category(name: str, image_id: str) -> str:
    """Create a new product category.

    Args:
        name: Category name.
        image_id: Category image id.
    """
    data = await make_backend_request(
        "/api/admin/categories", method="POST", body={"name": name, "imageId": image_id}
    )
    if data is None:
        return "Unable to create category."
    return str(data)

@mcp.tool()
async def admin_update_category(
    id: str, name: str | None = None, image_id: str | None = None
) -> str:
    """Update a category's name or image by id.

    Args:
        id: Category id.
        name: New name.
        image_id: New image id.
    """
    body = clean(name=name, imageId=image_id)
    data = await make_backend_request(f"/api/admin/categories/{id}", method="PATCH", body=body)
    if data is None:
        return "Unable to update category."
    return str(data)

@mcp.tool()
async def admin_delete_category(id: str) -> str:
    """Delete a category by id.

    Args:
        id: Category id.
    """
    data = await make_backend_request(f"/api/admin/categories/{id}", method="DELETE")
    if data is None:
        return "Unable to delete category."
    return str(data)

@mcp.tool()
async def admin_list_reviews() -> str:
    """Fetch all reviews for moderation."""
    data = await make_backend_request("/api/admin/reviews")
    if data is None:
        return "Unable to fetch reviews."
    return str(data)

@mcp.tool()
async def admin_delete_review(id: str) -> str:
    """Delete a review by id.

    Args:
        id: Review id.
    """
    data = await make_backend_request(f"/api/admin/reviews/{id}", method="DELETE")
    if data is None:
        return "Unable to delete review."
    return str(data)

@mcp.tool()
async def admin_list_users() -> str:
    """Fetch all registered users."""
    data = await make_backend_request("/api/admin/users")
    if data is None:
        return "Unable to fetch users."
    return str(data)

@mcp.tool()
async def admin_get_user(id: str) -> str:
    """Fetch one user by id.

    Args:
        id: User id.
    """
    data = await make_backend_request(f"/api/admin/users/{id}")
    if data is None:
        return "Unable to fetch user."
    return str(data)

@mcp.tool()
async def admin_delete_user(id: str) -> str:
    """Delete a user by id.

    Args:
        id: User id.
    """
    data = await make_backend_request(f"/api/admin/users/{id}", method="DELETE")
    if data is None:
        return "Unable to delete user."
    return str(data)


def main():
    # Initialize and run the server
    mcp.run(transport="stdio")


if __name__ == "__main__":
    main()
