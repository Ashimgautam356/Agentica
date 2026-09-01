from typing import Any

import httpx

from config import BACKEND_API_BASE


async def make_backend_request(path: str) -> Any | None:

    #Make a GET request to the Agentica Express backend with proper error handling


    url = f"{BACKEND_API_BASE}{path}"
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, timeout=30.0)
            response.raise_for_status()
            return response.json()
        except Exception:
            return None