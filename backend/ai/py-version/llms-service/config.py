import os

from dotenv import load_dotenv

load_dotenv()

BACKEND_API_BASE = os.environ.get("BACKEND_API_BASE", "http://localhost:4000")
MCP_TRANSPORT = os.environ.get("MCP_TRANSPORT", "stdio")
HOST = os.environ.get("HOST", "127.0.0.1")
PORT = int(os.environ.get("PORT", "8000"))


def csv_env(name: str) -> list[str]:
    return [
        value.strip() for value in os.environ.get(name, "").split(",") if value.strip()
    ]


MCP_ALLOWED_HOSTS = csv_env("MCP_ALLOWED_HOSTS") or ["127.0.0.1:*", "localhost:*"]
MCP_ALLOWED_ORIGINS = csv_env("MCP_ALLOWED_ORIGINS")
