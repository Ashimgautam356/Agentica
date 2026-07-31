import { createUserSchema, loginUserSchema } from "./user.schema";
import { z } from "zod";

export const createAdminSchema = createUserSchema;
export const loginAdminSchema = loginUserSchema;
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
export type UpdateAdminInput = z.infer<typeof updateAdminSchema>;
