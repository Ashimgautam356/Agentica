from server import mcp

# Importing these modules is what actually registers their @mcp.tool()
# functions onto the shared server — each import below has a side effect,
# even though nothing from them is used directly in this file.
from services import categories, orders, products, search  # noqa: F401


def main():
    mcp.run(transport="stdio")


if __name__ == "__main__":
    main()