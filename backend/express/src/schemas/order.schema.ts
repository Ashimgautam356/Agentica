import { z } from "zod";

export const orderIdSchema = z.object({
  id: z.uuid(),
});

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.uuid(),
        quantity: z.coerce.number().int().min(1).max(999),
      }),
    )
    .min(1),
  shippingName: z.string().trim().min(1).max(120),
  shippingContact: z.string().trim().min(1).max(40),
  shippingAddress: z.string().trim().min(1).max(240),
  shippingFee: z.coerce.number().min(0).default(0),
  tax: z.coerce.number().min(0).default(0),
  notes: z.string().trim().min(1).max(500).optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
});

export type OrderIdInput = z.infer<typeof orderIdSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
