import json
import os
import unittest
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

import httpx

from auth import API_KEY_ENV_VAR, get_api_key, require_api_key
from backend_client import (
    BackendRequestError,
    format_tool_response,
    make_backend_request,
)
from services import orders, products
from validation import is_valid_uuid, validate_search_query


class ValidationTests(unittest.TestCase):
    def test_uuid_validation(self):
        self.assertTrue(is_valid_uuid("550e8400-e29b-41d4-a716-446655440000"))
        self.assertFalse(is_valid_uuid("not-a-uuid"))

    def test_search_validation(self):
        self.assertEqual(validate_search_query("  "), "Search query cannot be empty.")
        self.assertIsNone(validate_search_query("laptop"))

    def test_tool_response_is_json(self):
        result = format_tool_response({"success": True, "items": [1, 2]})
        self.assertEqual(json.loads(result), {"success": True, "items": [1, 2]})


class AuthenticationTests(unittest.IsolatedAsyncioTestCase):
    async def test_missing_api_key_stops_protected_tool(self):
        called = False

        @require_api_key
        async def protected_tool():
            nonlocal called
            called = True

        with patch.dict(os.environ, {}, clear=True):
            result = await protected_tool()

        self.assertIn(API_KEY_ENV_VAR, result)
        self.assertFalse(called)

    async def test_request_api_key_is_used_instead_of_process_environment(self):
        ctx = SimpleNamespace(headers={"x-api-key": "request-key"})
        self.assertEqual(get_api_key(ctx), "request-key")

    async def test_bearer_api_key_is_supported(self):
        ctx = SimpleNamespace(headers={"authorization": "Bearer request-key"})
        self.assertEqual(get_api_key(ctx), "request-key")


class BackendClientTests(unittest.IsolatedAsyncioTestCase):
    async def test_http_error_preserves_safe_backend_message(self):
        request = httpx.Request("GET", "http://localhost:4000/api/orders")
        response = httpx.Response(
            401,
            request=request,
            json={"error": {"message": "Authentication required."}},
        )
        client = AsyncMock()
        client.request.return_value = response
        context = MagicMock()
        context.__aenter__ = AsyncMock(return_value=client)
        context.__aexit__ = AsyncMock(return_value=None)

        with patch("backend_client.httpx.AsyncClient", return_value=context):
            with self.assertRaisesRegex(
                BackendRequestError,
                r"Backend request failed \(401\): Authentication required\.",
            ):
                await make_backend_request("/api/orders", api_key="invalid")

    async def test_successful_response_returns_parsed_json(self):
        request = httpx.Request("GET", "http://localhost:4000/api/products")
        response = httpx.Response(200, request=request, json={"data": []})
        client = AsyncMock()
        client.request.return_value = response
        context = MagicMock()
        context.__aenter__ = AsyncMock(return_value=client)
        context.__aexit__ = AsyncMock(return_value=None)

        with patch("backend_client.httpx.AsyncClient", return_value=context):
            result = await make_backend_request("/api/products")

        self.assertEqual(result, {"data": []})


class OrderToolTests(unittest.IsolatedAsyncioTestCase):
    async def test_payment_uses_the_backend_card_processing_contract(self):
        backend_request = AsyncMock(return_value={"success": True})
        ctx = SimpleNamespace(headers={"x-api-key": "customer-key"})

        with (
            patch.dict(os.environ, {}, clear=True),
            patch("services.orders.make_backend_request", backend_request),
        ):
            result = await orders.create_payment(
                order_id="550e8400-e29b-41d4-a716-446655440000",
                card_number="4242 4242 4242 4242",
                expiry_month="12",
                expiry_year="2030",
                cvv="123",
                confirm=True,
                ctx=ctx,
            )

        backend_request.assert_awaited_once_with(
            "/api/payments/process",
            method="POST",
            body={
                "orderId": "550e8400-e29b-41d4-a716-446655440000",
                "cardNumber": "4242 4242 4242 4242",
                "expiryMonth": "12",
                "expiryYear": "2030",
                "cvv": "123",
            },
            api_key="customer-key",
        )
        self.assertEqual(json.loads(result), {"success": True})


class ProductToolTests(unittest.IsolatedAsyncioTestCase):
    async def test_product_reviews_use_public_product_endpoint(self):
        backend_request = AsyncMock(return_value={"data": {"items": []}})

        with patch("services.products.make_backend_request", backend_request):
            await products.get_product_reviews(
                "550e8400-e29b-41d4-a716-446655440000", page_size=5
            )

        backend_request.assert_awaited_once_with(
            "/api/products/550e8400-e29b-41d4-a716-446655440000/reviews?page=1&pageSize=5&sort=newest"
        )

    async def test_top_rated_products_reads_paginated_backend_response(self):
        backend_request = AsyncMock(
            return_value={
                "success": True,
                "data": {
                    "items": [
                        {"name": "Good", "averageRating": 4.2},
                        {"name": "Best", "averageRating": 4.9},
                    ]
                },
            }
        )

        with patch("services.products.make_backend_request", backend_request):
            result = await products.get_top_rated_products(limit=1)

        self.assertEqual(json.loads(result), [{"name": "Best", "averageRating": 4.9}])


if __name__ == "__main__":
    unittest.main()
