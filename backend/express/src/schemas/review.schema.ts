import { z } from "zod";

export const reviewIdSchema = z.object({
  id: z.uuid(),
});

export const customerReviewParamsSchema = z.object({
  id: z.uuid(),
  reviewId: z.uuid(),
});

export const createReviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  description: z.string().trim().min(1).max(1000),
  userId: z.uuid(),
  productId: z.uuid(),
});

export const createProductReviewSchema = createReviewSchema.pick({
  rating: true,
  description: true,
});

export const listProductReviewsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
  sort: z.enum(["rating-desc", "rating-asc", "newest", "oldest"]).default("newest"),
});

export type ReviewIdInput = z.infer<typeof reviewIdSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type CreateProductReviewInput = z.infer<typeof createProductReviewSchema>;
export type ListProductReviewsQueryInput = z.infer<typeof listProductReviewsQuerySchema>;
