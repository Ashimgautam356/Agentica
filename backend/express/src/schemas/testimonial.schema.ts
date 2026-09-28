import { z } from "zod";

export const createTestimonialSchema = z.object({
  message: z.string().trim().min(1).max(2000),
});

export type CreateTestimonialInput = z.infer<typeof createTestimonialSchema>;
