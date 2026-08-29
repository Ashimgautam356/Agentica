import { z } from "zod";

export const productIdSchema = z.object({
  id: z.uuid(),
});

export const listProductsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().trim().max(120).optional(),
  categoryId: z.uuid().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
});

export const createProductSchema = z.object({
  skuId: z.uuid().optional(),
  name: z.string().trim().min(1).max(180),
  imageId: z.string().trim().min(1).max(255),
  imageId1: z.string().trim().min(1).max(255).nullable().optional(),
  imageId2: z.string().trim().min(1).max(255).nullable().optional(),
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
export type ListProductsQueryInput = z.infer<typeof listProductsQuerySchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
