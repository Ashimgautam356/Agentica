import os
from functools import wraps
from typing import Callable

from mcp.server.mcpserver import Context

# The MCP client (whatever agent/app is connecting to this server) sets this
# environment variable when it launches the server process. This matches
# the real customer API key your team's Express backend already issues via
# POST /api/auth/api-key after signup/login.
API_KEY_ENV_VAR = "AGENTICA_API_KEY"


def get_api_key(ctx: Context | None = None) -> str | None:
    """Read the customer key from this HTTP request or the stdio environment."""
    headers = ctx.headers if ctx is not None else None
    if headers:
        api_key = headers.get("x-api-key")
        if api_key:
            return api_key

        authorization = headers.get("authorization", "")
        scheme, _, token = authorization.partition(" ")
        if scheme.lower() == "bearer" and token:
            return token

    return os.environ.get(API_KEY_ENV_VAR)


def require_api_key(func: Callable) -> Callable:
    """Require a key before calling a protected backend route.

    The protected route validates the forwarded key, avoiding a redundant
    /api/auth/me request before every operation.
    """

    @wraps(func)
    async def wrapper(*args, **kwargs):
        api_key = get_api_key(kwargs.get("ctx"))
        if not api_key:
            return (
                "Missing API key. Send x-api-key or Authorization: Bearer <key>; "
                f"stdio clients may set {API_KEY_ENV_VAR}."
            )

        return await func(*args, **kwargs)

    return wrapper
