import { z } from "zod";

export const userIdSchema = z.object({
  id: z.uuid(),
});

export const userSessionIdSchema = z.object({
  id: z.uuid(),
  sessionId: z.uuid(),
});

export const createUserSchema = z.object({
  email: z.email().toLowerCase(),
  password: z.string().min(8).max(128),
  firstName: z.string().trim().min(1).max(80).optional(),
  lastName: z.string().trim().min(1).max(80).optional(),
  imageId: z.string().trim().min(1).max(255).optional(),
  age: z.number().int().min(0).max(130).optional(),
  contact: z.string().trim().min(1).max(40).optional(),
  address: z.string().trim().min(1).max(240).optional(),
});

export const loginUserSchema = z.object({
  email: z.email().toLowerCase(),
  password: z.string().min(1),
});

export const updateUserSchema = createUserSchema
  .omit({ password: true })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required.",
  });

export const updateUserPasswordSchema = z.object({
  password: z.string().min(8).max(128),
});

export type UserIdInput = z.infer<typeof userIdSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type LoginUserInput = z.infer<typeof loginUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateUserPasswordInput = z.infer<typeof updateUserPasswordSchema>;
