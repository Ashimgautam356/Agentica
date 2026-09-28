import type { PaymentStatus } from "@prisma/client";
import { prisma } from "../prisma";

export function findOrderForPayment(userId: string, orderId: string) {
  return prisma.order.findFirst({
    where: { id: orderId, userId },
    select: {
      id: true,
      userId: true,
      total: true,
      status: true,
      paymentStatus: true,
      paymentReference: true,
    },
  });
}

export async function recordPaymentResult(
  userId: string,
  orderId: string,
  status: Extract<PaymentStatus, "PAID" | "FAILED">,
  transactionId: string,
  cardLast4: string,
  expiryMonth: string,
  expiryYear: string,
) {
  return prisma.$transaction(async (transaction) => {
    const updated = await transaction.order.updateMany({
      where: { id: orderId, userId, paymentStatus: { not: "PAID" } },
      data: { paymentStatus: status, paymentReference: transactionId },
    });

    if (updated.count === 0) {
      return transaction.order.findFirstOrThrow({
        where: { id: orderId, userId },
        select: { paymentStatus: true, paymentReference: true },
      });
    }

    const order = await transaction.order.findUniqueOrThrow({
      where: { id: orderId },
      select: { total: true },
    });

    await transaction.payment.create({
      data: {
        orderId,
        userId,
        amount: order.total,
        method: "CARD",
        status,
        transactionId,
        cardLast4,
        expiryMonth,
        expiryYear,
        paidAt: status === "PAID" ? new Date() : null,
      },
    });

    return { paymentStatus: status, paymentReference: transactionId };
  });
}
