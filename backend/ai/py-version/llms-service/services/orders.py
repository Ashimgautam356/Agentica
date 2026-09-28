from auth import get_api_key, require_api_key
from backend_client import (
    format_tool_response,
    handle_backend_errors,
    make_backend_request,
)
from server import mcp
from validation import is_valid_uuid
from mcp.server.mcpserver import Context


@mcp.tool()
@handle_backend_errors
@require_api_key
async def list_my_orders(ctx: Context | None = None) -> str:
    """Fetch the logged-in customer's own past orders."""
    data = await make_backend_request("/api/orders", api_key=get_api_key(ctx))
    return format_tool_response(data)


@mcp.tool()
@handle_backend_errors
@require_api_key
async def get_my_order(id: str, ctx: Context | None = None) -> str:
    """Fetch one of the logged-in customer's own orders by id.

    Args:
        id: Order id.
    """
    if not is_valid_uuid(id):
        return "Invalid order id — must be a valid UUID."

    data = await make_backend_request(f"/api/orders/{id}", api_key=get_api_key(ctx))
    return format_tool_response(data)


@mcp.tool()
@handle_backend_errors
@require_api_key
async def create_order(
    product_id: str,
    quantity: int,
    shipping_name: str,
    shipping_contact: str,
    shipping_address: str,
    confirm: bool = False,
    ctx: Context | None = None,
) -> str:
    """Place a new order for ONE product. This creates a real order in the
    system — it does NOT charge payment yet, use create_payment separately
    to complete checkout. Because this is a real purchase action, it will
    refuse to run unless confirm=True is explicitly passed — the calling
    agent must have clearly confirmed the order details with the user
    first.

    Args:
        product_id: The product id to order.
        quantity: How many units to order.
        shipping_name: Name for the shipping address.
        shipping_contact: Phone/contact number for delivery.
        shipping_address: Full shipping address.
        confirm: Must be explicitly set to True. This is a safety check —
            do not set this without the user having clearly confirmed they
            want to place this order.
    """
    if not confirm:
        return (
            "Order not placed. Set confirm=True only after the user has "
            "explicitly confirmed the product, quantity, and shipping "
            "details."
        )

    if not is_valid_uuid(product_id):
        return "Invalid product id — must be a valid UUID."
    if quantity < 1 or quantity > 999:
        return "Quantity must be between 1 and 999."

    body = {
        "items": [{"productId": product_id, "quantity": quantity}],
        "shippingName": shipping_name,
        "shippingContact": shipping_contact,
        "shippingAddress": shipping_address,
    }

    data = await make_backend_request(
        "/api/orders", method="POST", body=body, api_key=get_api_key(ctx)
    )
    return format_tool_response(data)


@mcp.tool()
@handle_backend_errors
@require_api_key
async def create_payment(
    order_id: str,
    card_number: str,
    expiry_month: str,
    expiry_year: str,
    cvv: str,
    confirm: bool = False,
    ctx: Context | None = None,
) -> str:
    """Pay for an existing order, completing the purchase. This is a real
    payment action and will refuse to run unless confirm=True is
    explicitly passed.

    Args:
        order_id: The order id to pay for (from create_order's result).
        card_number: Card number containing 13-19 digits; spaces and hyphens are allowed.
        expiry_month: Two-digit expiry month, from 01 to 12.
        expiry_year: Four-digit expiry year.
        cvv: Three- or four-digit card security code.
        confirm: Must be explicitly set to True. Do not set this without
            the user having clearly confirmed they want to pay now.
    """
    if not confirm:
        return "Payment not made. Set confirm=True only after the user has explicitly confirmed."

    if not is_valid_uuid(order_id):
        return "Invalid order id — must be a valid UUID."

    data = await make_backend_request(
        "/api/payments/process",
        method="POST",
        body={
            "orderId": order_id,
            "cardNumber": card_number,
            "expiryMonth": expiry_month,
            "expiryYear": expiry_year,
            "cvv": cvv,
        },
        api_key=get_api_key(ctx),
    )
    return format_tool_response(data)
