import { ApiError } from "../errors/api-error";
import { paginatedResult, type Pagination } from "../lib/pagination";
import { prisma } from "../prisma";
import { MockPaymentProvider } from "../providers/mock-payment.provider";
import type { PaymentProvider, PaymentResult } from "../providers/payment.provider";
import * as paymentRepository from "../repositories/payment.repository";
import type {
  CreatePaymentInput,
  ProcessPaymentInput,
  UpdatePaymentStatusInput,
} from "../schemas/payment.schema";

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

export async function listCustomerPayments(customerId: string, pagination: Pagination) {
  const [items, total] = await prisma.$transaction([
    prisma.payment.findMany({
      where: { userId: customerId, method: "CARD" },
      include: { order: true },
      orderBy: { createdAt: "desc" },
      skip: (pagination.page - 1) * pagination.pageSize,
      take: pagination.pageSize,
    }),
    prisma.payment.count({ where: { userId: customerId, method: "CARD" } }),
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
  return prisma.$transaction(async (transaction) => {
    const payment = await transaction.payment.update({
      where: { id },
      data: {
        ...data,
        paidAt: data.status === "PAID" ? new Date() : null,
      },
      include: paymentInclude,
    });

    await transaction.order.update({
      where: { id: payment.orderId },
      data: {
        paymentStatus: data.status,
        paymentReference: payment.transactionId,
      },
    });

    return payment;
  });
}

const paymentProvider: PaymentProvider = new MockPaymentProvider();

export async function processPayment(
  customerId: string,
  data: ProcessPaymentInput,
): Promise<PaymentResult> {
  const order = await paymentRepository.findOrderForPayment(customerId, data.orderId);

  if (!order) {
    throw new ApiError("NOT_FOUND", "Order not found.");
  }

  if (order.status === "CANCELLED") {
    throw new ApiError("BAD_REQUEST", "Cannot pay for a cancelled order.");
  }

  if (order.paymentStatus === "REFUNDED") {
    throw new ApiError("BAD_REQUEST", "A refunded order cannot be paid again.");
  }

  if (order.paymentStatus === "PAID" && order.paymentReference) {
    return { success: true, transactionId: order.paymentReference, status: "PAID" };
  }

  const result = await paymentProvider.processPayment(
    data.orderId,
    data.cardNumber,
    data.expiryMonth,
    data.expiryYear,
    data.cvv,
  );
  const saved = await paymentRepository.recordPaymentResult(
    customerId,
    data.orderId,
    result.status,
    result.transactionId,
    data.cardNumber.slice(-4),
    data.expiryMonth,
    data.expiryYear,
  );

  return {
    success: saved.paymentStatus === "PAID",
    transactionId: saved.paymentReference ?? result.transactionId,
    status: saved.paymentStatus as "PAID" | "FAILED",
  };
}
