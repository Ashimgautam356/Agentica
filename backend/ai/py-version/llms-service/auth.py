import os
from functools import wraps
from typing import Any, Callable

from backend_client import make_backend_request

# The MCP client (whatever agent/app is connecting to this server) sets this
# environment variable when it launches the server process. This matches
# the real customer API key your team's Express backend already issues via
# POST /api/auth/api-key after signup/login.
API_KEY_ENV_VAR = "AGENTICA_API_KEY"


def get_api_key() -> str | None:
    """The current request's API key, for tools that need to forward it to
    protected backend routes (orders, payments)."""
    return os.environ.get(API_KEY_ENV_VAR)


async def verify_api_key(api_key: str) -> dict[str, Any] | None:
    """Check the key is real by calling the backend's own "who am I" route.
    This is the actual customer-auth check your Express backend already
    does for any request carrying the x-api-key header — GET /api/auth/me
    returns the logged-in customer's info if the key is valid, or fails
    (None here) if it isn't."""
    if not api_key:
        return None

    return await make_backend_request("/api/auth/me", api_key=api_key)


def require_api_key(func: Callable) -> Callable:
    """Decorator applied to every tool. Checks a valid API key is present
    and belongs to a real logged-in customer BEFORE the tool's own logic
    runs at all."""

    @wraps(func)
    async def wrapper(*args, **kwargs):
        api_key = os.environ.get(API_KEY_ENV_VAR)
        if not api_key:
            return f"Missing API key. Set the {API_KEY_ENV_VAR} environment variable."

        user = await verify_api_key(api_key)
        if user is None:
            return "Invalid or expired API key."

        return await func(*args, **kwargs)

    return wrapper
