#Imports
from typing import Any

import httpx
from mcp.server.mcpserver import MCPServer


# SERVER SETUP
# Creates the MCP server instance and sets the address of the Express
# backend this server talks to

mcp = MCPServer("agentica")

BACKEND_API_BASE = "http://localhost:4000"


#Sends a GET request to the Express backend API and returns the response data

async def make_backend_request(path: str):

#Make a GET request to the Agentica Express backend with proper error handling
    url = f"{BACKEND_API_BASE}{path}"
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, timeout=30.0)
            response.raise_for_status()
            return response.json()
        except Exception:
            return None



#list_products

@mcp.tool()
async def list_products() -> str:

#Fetch products from the Express backend public API

    data = await make_backend_request("/api/products")
    if data is None:
        return "Unable to fetch products."
    return str(data)


#get_product

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


#list_categories

@mcp.tool()
async def list_categories() -> str:
    """Fetch categories from the Express backend public API."""
    data = await make_backend_request("/api/categories")
    if data is None:
        return "Unable to fetch categories."
    return str(data)


#list_products_by_category

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



def main():
    mcp.run(transport="stdio")


if __name__ == "__main__":
    main() 