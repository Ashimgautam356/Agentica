import { z } from "zod";

export const stockIdSchema = z.object({
  id: z.uuid(),
});

export const createStockSchema = z.object({
  productId: z.uuid(),
  quantity: z.coerce.number().int().min(0),
  reserved: z.coerce.number().int().min(0).default(0),
  lowStockThreshold: z.coerce.number().int().min(0).default(5),
});

export const updateStockSchema = createStockSchema
  .omit({ productId: true })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required.",
  });

export type StockIdInput = z.infer<typeof stockIdSchema>;
export type CreateStockInput = z.infer<typeof createStockSchema>;
export type UpdateStockInput = z.infer<typeof updateStockSchema>;
