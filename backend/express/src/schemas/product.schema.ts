import { z } from "zod";

export const productIdSchema = z.object({
  id: z.uuid(),
});

export const createProductSchema = z.object({
  skuId: z.uuid().optional(),
  name: z.string().trim().min(1).max(180),
  imageId: z.string().trim().min(1).max(255),
  description: z.array(z.string().trim().min(1).max(500)).default([]),
  price: z.coerce.number().positive(),
  tags: z.array(z.string().trim().min(1).max(80)).default([]),
  categoryId: z.uuid(),
});

export const updateProductSchema = createProductSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required.",
  });

export type ProductIdInput = z.infer<typeof productIdSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
