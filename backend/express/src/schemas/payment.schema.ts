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

const currentYear = new Date().getUTCFullYear();

export const processPaymentSchema = z
  .object({
    orderId: z.uuid(),
    cardNumber: z
      .string()
      .transform((value) => value.replace(/[\s-]/g, ""))
      .pipe(z.string().regex(/^\d{13,19}$/)),
    expiryMonth: z.string().regex(/^(0[1-9]|1[0-2])$/),
    expiryYear: z.string().regex(/^\d{4}$/),
    cvv: z.string().regex(/^\d{3,4}$/),
  })
  .refine(
    ({ expiryMonth, expiryYear }) =>
      Number(expiryYear) > currentYear ||
      (Number(expiryYear) === currentYear && Number(expiryMonth) >= new Date().getUTCMonth() + 1),
    { message: "Card expiry date must be in the future.", path: ["expiryMonth"] },
  );

export type PaymentIdInput = z.infer<typeof paymentIdSchema>;
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type UpdatePaymentStatusInput = z.infer<typeof updatePaymentStatusSchema>;
export type ProcessPaymentInput = z.infer<typeof processPaymentSchema>;
