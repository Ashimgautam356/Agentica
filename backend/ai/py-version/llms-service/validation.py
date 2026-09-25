import uuid

def is_valid_uuid(value: str) -> bool:
    """Check that a string is a valid UUID, since product/category/user ids
    in this project are always UUIDs."""
    try:
        uuid.UUID(value)
        return True
    except (ValueError, AttributeError, TypeError):
        return False


def validate_search_query(query: str) -> str | None:
    """Return an error message if the search query is invalid, else None."""
    if not query or not query.strip():
        return "Search query cannot be empty."
    if len(query) > 200:
        return "Search query is too long (max 200 characters)."
    return None