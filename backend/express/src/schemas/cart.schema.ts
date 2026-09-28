import { z } from "zod";

export const cartProductParamsSchema = z.object({ productId: z.uuid() });

export const addCartItemSchema = z.object({
  productId: z.uuid(),
  quantity: z.coerce.number().int().min(1).max(999).default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().min(1).max(999),
});

export type AddCartItemInput = z.infer<typeof addCartItemSchema>;
