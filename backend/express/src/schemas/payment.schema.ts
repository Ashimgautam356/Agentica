import { z } from "zod";

export const paymentIdSchema = z.object({
  id: z.uuid(),
});

export const createPaymentSchema = z.object({
  method: z.enum(["CASH_ON_DELIVERY", "CARD", "ESEWA", "KHALTI", "BANK_TRANSFER"]),
  transactionId: z.string().trim().min(1).max(120).optional(),
});

export const updatePaymentStatusSchema = z.object({
  status: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]),
  transactionId: z.string().trim().min(1).max(120).optional(),
});

export type PaymentIdInput = z.infer<typeof paymentIdSchema>;
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type UpdatePaymentStatusInput = z.infer<typeof updatePaymentStatusSchema>;
