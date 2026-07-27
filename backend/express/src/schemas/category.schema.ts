import { z } from "zod";

export const categoryIdSchema = z.object({
  id: z.uuid(),
});

export const createCategorySchema = z.object({
  name: z.string().trim().min(1).max(120),
});

export const updateCategorySchema = createCategorySchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required.",
  });

export type CategoryIdInput = z.infer<typeof categoryIdSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
