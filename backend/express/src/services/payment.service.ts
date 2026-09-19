import { ApiError } from "../errors/api-error";
import { paginatedResult, type Pagination } from "../lib/pagination";
import { prisma } from "../prisma";
import type { CreatePaymentInput, UpdatePaymentStatusInput } from "../schemas/payment.schema";

const paymentInclude = {
  user: {
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
    },
  },
  order: true,
} as const;

export async function listPayments(pagination: Pagination) {
  const [items, total] = await prisma.$transaction([
    prisma.payment.findMany({
      include: paymentInclude,
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      skip: (pagination.page - 1) * pagination.pageSize,
      take: pagination.pageSize,
    }),
    prisma.payment.count(),
  ]);

  return paginatedResult(items, total, pagination);
}

export function getPayment(id: string) {
  return prisma.payment.findUniqueOrThrow({
    where: { id },
    include: paymentInclude,
  });
}

export async function createPayment(customerId: string, orderId: string, data: CreatePaymentInput) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: customerId },
    select: { id: true, total: true, status: true },
  });

  if (!order) {
    throw new ApiError("NOT_FOUND", "Order not found.");
  }

  if (order.status === "CANCELLED") {
    throw new ApiError("BAD_REQUEST", "Cannot pay for a cancelled order.");
  }

  return prisma.payment.create({
    data: {
      orderId,
      userId: customerId,
      amount: order.total,
      method: data.method,
      transactionId: data.transactionId,
      status: data.method === "CASH_ON_DELIVERY" ? "PENDING" : "PAID",
      paidAt: data.method === "CASH_ON_DELIVERY" ? null : new Date(),
    },
    include: paymentInclude,
  });
}

export function updatePaymentStatus(id: string, data: UpdatePaymentStatusInput) {
  return prisma.payment.update({
    where: { id },
    data: {
      ...data,
      paidAt: data.status === "PAID" ? new Date() : null,
    },
    include: paymentInclude,
  });
}
