import { z } from "zod";

export const reviewIdSchema = z.object({
  id: z.uuid(),
});

export const createReviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  description: z.string().trim().min(1).max(1000),
  userId: z.uuid(),
  productId: z.uuid(),
});

export type ReviewIdInput = z.infer<typeof reviewIdSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
