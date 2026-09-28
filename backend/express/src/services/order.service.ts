import { ApiError } from "../errors/api-error";
import { paginatedResult, type Pagination } from "../lib/pagination";
import { prisma } from "../prisma";
import type { CreateOrderInput, UpdateOrderStatusInput } from "../schemas/order.schema";

const orderInclude = {
  user: {
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      contact: true,
    },
  },
  items: {
    include: {
      product: {
        include: { category: true },
      },
    },
  },
  payments: true,
} as const;

export async function listOrders(pagination: Pagination) {
  const [items, total] = await prisma.$transaction([
    prisma.order.findMany({
      include: orderInclude,
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      skip: (pagination.page - 1) * pagination.pageSize,
      take: pagination.pageSize,
    }),
    prisma.order.count(),
  ]);

  return paginatedResult(items, total, pagination);
}

export async function listCustomerOrders(customerId: string, pagination: Pagination) {
  const [items, total] = await prisma.$transaction([
    prisma.order.findMany({
      where: { userId: customerId },
      include: orderInclude,
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      skip: (pagination.page - 1) * pagination.pageSize,
      take: pagination.pageSize,
    }),
    prisma.order.count({ where: { userId: customerId } }),
  ]);

  return paginatedResult(items, total, pagination);
}

export function getOrder(id: string) {
  return prisma.order.findUniqueOrThrow({
    where: { id },
    include: orderInclude,
  });
}

export function getCustomerOrder(customerId: string, id: string) {
  return prisma.order.findFirstOrThrow({
    where: { id, userId: customerId },
    include: orderInclude,
  });
}

export async function createOrder(customerId: string, data: CreateOrderInput) {
  const requestedItems = combineItems(data.items);
  const productIds = requestedItems.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  });

  if (products.length !== productIds.length) {
    throw new ApiError("BAD_REQUEST", "One or more products were not found.");
  }

  let subtotal = 0;
  const orderItems = requestedItems.map((item) => {
    const product = products.find((candidate) => candidate.id === item.productId);

    if (!product) {
      throw new ApiError("BAD_REQUEST", "One or more products were not found.");
    }

    const unitPrice = Number(product.price);
    const total = unitPrice * item.quantity;
    subtotal += total;

    return {
      productId: item.productId,
      quantity: item.quantity,
      unitPrice,
      total,
    };
  });
  const total = subtotal + data.shippingFee + data.tax;

  return prisma.order.create({
    data: {
      userId: customerId,
      subtotal,
      shippingFee: data.shippingFee,
      tax: data.tax,
      total,
      shippingName: data.shippingName,
      shippingContact: data.shippingContact,
      shippingAddress: data.shippingAddress,
      notes: data.notes,
      items: {
        create: orderItems,
      },
    },
    include: orderInclude,
  });
}

export async function updateOrderStatus(id: string, data: UpdateOrderStatusInput) {
  return prisma.$transaction(async (transaction) => {
    const order = await transaction.order.findUnique({
      where: { id },
      select: { id: true, orderNumber: true, status: true, userId: true },
    });

    if (!order) {
      throw new ApiError("NOT_FOUND", "Order not found.");
    }

    if (order.status === "CANCELLED") {
      throw new ApiError("BAD_REQUEST", "A cancelled order's status cannot be changed.");
    }

    if (order.status !== data.status) {
      const updated = await transaction.order.updateMany({
        where: { id, status: { not: "CANCELLED" } },
        data,
      });

      if (updated.count === 0) {
        throw new ApiError("BAD_REQUEST", "A cancelled order's status cannot be changed.");
      }

      await transaction.notification.create({
        data: {
          userId: order.userId,
          orderId: order.id,
          title: "Order status updated",
          message: `Order #${order.orderNumber.slice(0, 8)} changed from ${formatStatus(order.status)} to ${formatStatus(data.status)}.`,
        },
      });
    }

    return transaction.order.findUniqueOrThrow({ where: { id }, include: orderInclude });
  });
}

export async function cancelCustomerOrder(customerId: string, id: string) {
  const order = await prisma.order.findFirst({ where: { id, userId: customerId } });

  if (!order) {
    throw new ApiError("NOT_FOUND", "Order not found.");
  }

  if (order.status !== "PENDING" && order.status !== "CONFIRMED") {
    throw new ApiError("BAD_REQUEST", "This order can no longer be cancelled.");
  }

  return prisma.$transaction(async (transaction) => {
    if (order.paymentStatus === "PAID") {
      await transaction.payment.updateMany({
        where: { orderId: id, status: "PAID" },
        data: { status: "REFUNDED" },
      });
    }

    const cancelledOrder = await transaction.order.update({
      where: { id },
      data: {
        status: "CANCELLED",
        paymentStatus: order.paymentStatus === "PAID" ? "REFUNDED" : order.paymentStatus,
      },
      include: orderInclude,
    });

    await transaction.notification.create({
      data: {
        userId: customerId,
        orderId: id,
        title: "Order cancelled",
        message:
          order.paymentStatus === "PAID"
            ? `Order #${order.orderNumber.slice(0, 8)} was cancelled and refunded.`
            : `Order #${order.orderNumber.slice(0, 8)} was cancelled.`,
      },
    });

    return cancelledOrder;
  });
}

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

function combineItems(items: CreateOrderInput["items"]) {
  return Array.from(
    items
      .reduce((map, item) => {
        map.set(item.productId, (map.get(item.productId) ?? 0) + item.quantity);
        return map;
      }, new Map<string, number>())
      .entries(),
  ).map(([productId, quantity]) => ({ productId, quantity }));
}
