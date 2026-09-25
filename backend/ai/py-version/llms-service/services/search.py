from ddgs import DDGS

from auth import require_api_key
from server import mcp
from validation import validate_search_query


@mcp.tool()
@require_api_key
async def search_web(query: str) -> str:
    """Search the internet for a query and return the top results. Used to
    compare a product against listings/prices outside our own site.

    Args:
        query: What to search for, e.g. a product name.
    """
    error = validate_search_query(query)
    if error:
        return error

    try:
        results = DDGS().text(query, max_results=5)
        if not results:
            return "No results found."
        lines = [f"{r['title']}: {r['body']} ({r['href']})" for r in results]
        return "\n".join(lines)
    except Exception:
        return "Unable to search the web right now."
