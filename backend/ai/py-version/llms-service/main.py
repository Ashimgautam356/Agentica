from server import mcp



from services import categories, products, search  # noqa: F401


def main():
    mcp.run(transport="stdio")


if __name__ == "__main__":
    main()