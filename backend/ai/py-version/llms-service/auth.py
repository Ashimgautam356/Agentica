import os
from functools import wraps
from typing import Any, Callable

import httpx

from config import BACKEND_API_BASE


API_KEY_ENV_VAR = "AGENTICA_API_KEY"


async def verify_api_key(api_key: str) -> dict[str, Any] | None:

    #Ask the Express backend whether this API key belongs to a real,
    #logged-in user. Returns the user's info if valid, None otherwise
    
    if not api_key:
        return None

    url = f"{BACKEND_API_BASE}/api/auth/verify-api-key"
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, json={"apiKey": api_key}, timeout=10.0)
            if response.status_code != 200:
                return None
            return response.json()
        except Exception:
            return None


def require_api_key(func: Callable) -> Callable:
    """Decorator applied to every tool. Checks a valid API key is present
    and belongs to a real user BEFORE the tool's own logic runs at all."""

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
