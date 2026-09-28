import json
from functools import wraps
from typing import Any

import httpx

from config import BACKEND_API_BASE

# Set by auth.py once a request's API key is confirmed valid — sent on to
# the real Express backend so it knows which logged-in customer this is.
API_KEY_HEADER = "x-api-key"


class BackendRequestError(RuntimeError):
    """A safe, user-facing description of a failed backend request."""


def format_tool_response(data: Any) -> str:
    """Serialize backend data as valid, readable JSON for MCP clients."""
    return json.dumps(data, ensure_ascii=False, indent=2, default=str)


def handle_backend_errors(func):
    """Turn backend failures into useful MCP tool responses."""

    @wraps(func)
    async def wrapper(*args, **kwargs):
        try:
            return await func(*args, **kwargs)
        except BackendRequestError as error:
            return str(error)

    return wrapper


def _error_message(response: httpx.Response) -> str:
    try:
        payload = response.json()
    except ValueError:
        return response.reason_phrase

    if isinstance(payload, dict):
        error = payload.get("error")
        if isinstance(error, dict) and isinstance(error.get("message"), str):
            return error["message"]

    return response.reason_phrase


async def make_backend_request(
    path: str,
    method: str = "GET",
    body: dict | None = None,
    api_key: str | None = None,
) -> Any:
    """Make a request to the Agentica Express backend with proper error handling."""
    url = f"{BACKEND_API_BASE}{path}"
    headers = {API_KEY_HEADER: api_key} if api_key else None

    async with httpx.AsyncClient() as client:
        try:
            response = await client.request(
                method, url, json=body, headers=headers, timeout=30.0
            )
            response.raise_for_status()
        except httpx.HTTPStatusError as error:
            status = error.response.status_code
            message = _error_message(error.response)
            raise BackendRequestError(
                f"Backend request failed ({status}): {message}"
            ) from error
        except httpx.RequestError as error:
            raise BackendRequestError(
                "Unable to reach the Agentica backend."
            ) from error

        if response.status_code == 204:
            return {"success": True}

        try:
            return response.json()
        except ValueError as error:
            raise BackendRequestError(
                "The Agentica backend returned an invalid response."
            ) from error
