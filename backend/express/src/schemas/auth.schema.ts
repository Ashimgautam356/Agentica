import { createUserSchema, loginUserSchema } from "./user.schema";
import { z } from "zod";

export const createAdminSchema = createUserSchema;
export const loginAdminSchema = loginUserSchema;
export const signupCustomerSchema = createUserSchema;
export const loginCustomerSchema = loginUserSchema;
export const forgotCustomerPasswordSchema = z.object({
  email: z.email().toLowerCase(),
});
export const verifyAdminEmailSchema = z.object({
  pin: z.string().regex(/^\d{6}$/, "PIN must be 6 digits."),
});
export const forgotAdminPasswordSchema = z.object({
  email: z.email().toLowerCase(),
});
export const verifyAdminPasswordResetPinSchema = z.object({
  email: z.email().toLowerCase(),
  pin: z.string().regex(/^\d{6}$/, "PIN must be 6 digits."),
});
export const resetAdminPasswordSchema = z.object({
  email: z.email().toLowerCase(),
  resetToken: z.string().min(32),
  password: z.string().min(8).max(128),
});
export const updateAdminSchema = z
  .object({
    email: z.email().toLowerCase().optional(),
    password: z.string().min(8).max(128).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required.",
  });

export type CreateAdminInput = z.infer<typeof createAdminSchema>;
export type LoginAdminInput = z.infer<typeof loginAdminSchema>;
export type SignupCustomerInput = z.infer<typeof signupCustomerSchema>;
export type LoginCustomerInput = z.infer<typeof loginCustomerSchema>;
export type ForgotCustomerPasswordInput = z.infer<typeof forgotCustomerPasswordSchema>;
export type VerifyAdminEmailInput = z.infer<typeof verifyAdminEmailSchema>;
export type ForgotAdminPasswordInput = z.infer<typeof forgotAdminPasswordSchema>;
export type VerifyAdminPasswordResetPinInput = z.infer<typeof verifyAdminPasswordResetPinSchema>;
export type ResetAdminPasswordInput = z.infer<typeof resetAdminPasswordSchema>;
export type UpdateAdminInput = z.infer<typeof updateAdminSchema>;
