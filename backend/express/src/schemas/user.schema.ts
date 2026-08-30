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
  dob: z.coerce.date().optional(),
  gender: z.string().trim().min(1).max(40).optional(),
  contact: z.string().trim().min(1).max(40).optional(),
  address: z.string().trim().min(1).max(240).optional(),
});

export const loginUserSchema = z.object({
  email: z.email().toLowerCase(),
  password: z.string().min(1),
});

export const updateUserSchema = z
  .object({
    email: z.email().toLowerCase().optional(),
    firstName: z.string().trim().min(1).max(80).nullable().optional(),
    lastName: z.string().trim().min(1).max(80).nullable().optional(),
    imageId: z.string().trim().min(1).max(255).nullable().optional(),
    age: z.number().int().min(0).max(130).nullable().optional(),
    dob: z.coerce.date().nullable().optional(),
    gender: z.string().trim().min(1).max(40).nullable().optional(),
    contact: z.string().trim().min(1).max(40).nullable().optional(),
    address: z.string().trim().min(1).max(240).nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required.",
  });

export const updateUserPasswordSchema = z.object({
  password: z.string().min(8).max(128),
});

export const updateCustomerPasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8).max(128),
    confirmPassword: z.string().min(8).max(128),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type UserIdInput = z.infer<typeof userIdSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type LoginUserInput = z.infer<typeof loginUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateUserPasswordInput = z.infer<typeof updateUserPasswordSchema>;
export type UpdateCustomerPasswordInput = z.infer<typeof updateCustomerPasswordSchema>;
