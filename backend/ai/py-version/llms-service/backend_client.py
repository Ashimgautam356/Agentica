import os
from typing import Any

import httpx

from config import BACKEND_API_BASE

# Set by auth.py once a request's API key is confirmed valid — sent on to
# the real Express backend so it knows which logged-in customer this is.
API_KEY_HEADER = "x-api-key"


async def make_backend_request(
    path: str,
    method: str = "GET",
    body: dict | None = None,
    api_key: str | None = None,
) -> Any | None:
    """Make a request to the Agentica Express backend with proper error handling."""
    url = f"{BACKEND_API_BASE}{path}"
    headers = {API_KEY_HEADER: api_key} if api_key else None

    async with httpx.AsyncClient() as client:
        try:
            response = await client.request(
                method, url, json=body, headers=headers, timeout=30.0
            )
            response.raise_for_status()
            if response.status_code == 204:
                return {"success": True}
            return response.json()
        except Exception:
            return None

            return None