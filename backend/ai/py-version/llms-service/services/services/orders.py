from auth import get_api_key, require_api_key
from backend_client import make_backend_request
from server import mcp
from validation import is_valid_uuid

VALID_PAYMENT_METHODS = {"CASH_ON_DELIVERY", "CARD", "ESEWA", "KHALTI", "BANK_TRANSFER"}


@mcp.tool()
@require_api_key
async def list_my_orders() -> str:
    """Fetch the logged-in customer's own past orders."""
    data = await make_backend_request("/api/orders", api_key=get_api_key())
    if data is None:
        return "Unable to fetch orders."
    return str(data)


@mcp.tool()
@require_api_key
async def get_my_order(id: str) -> str:
    """Fetch one of the logged-in customer's own orders by id.

    Args:
        id: Order id.
    """
    if not is_valid_uuid(id):
        return "Invalid order id — must be a valid UUID."

    data = await make_backend_request(f"/api/orders/{id}", api_key=get_api_key())
    if data is None:
        return "Unable to fetch order or order not found."
    return str(data)


@mcp.tool()
@require_api_key
async def create_order(
    product_id: str,
    quantity: int,
    shipping_name: str,
    shipping_contact: str,
    shipping_address: str,
    confirm: bool = False,
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
        "/api/orders", method="POST", body=body, api_key=get_api_key()
    )
    if data is None:
        return "Unable to place order."
    return str(data)


@mcp.tool()
@require_api_key
async def create_payment(order_id: str, method: str, confirm: bool = False) -> str:
    """Pay for an existing order, completing the purchase. This is a real
    payment action and will refuse to run unless confirm=True is
    explicitly passed.

    Args:
        order_id: The order id to pay for (from create_order's result).
        method: One of CASH_ON_DELIVERY, CARD, ESEWA, KHALTI, BANK_TRANSFER.
        confirm: Must be explicitly set to True. Do not set this without
            the user having clearly confirmed they want to pay now.
    """
    if not confirm:
        return "Payment not made. Set confirm=True only after the user has explicitly confirmed."

    if not is_valid_uuid(order_id):
        return "Invalid order id — must be a valid UUID."
    if method not in VALID_PAYMENT_METHODS:
        return f"Invalid payment method — must be one of: {', '.join(VALID_PAYMENT_METHODS)}."

    data = await make_backend_request(
        f"/api/orders/{order_id}/payments",
        method="POST",
        body={"method": method},
        api_key=get_api_key(),
    )
    if data is None:
        return "Unable to process payment."
    return str(data)
