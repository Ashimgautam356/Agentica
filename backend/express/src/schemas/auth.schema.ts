import { createUserSchema, loginUserSchema } from "./user.schema";
import type { z } from "zod";

export const createAdminSchema = createUserSchema;
export const loginAdminSchema = loginUserSchema;

export type CreateAdminInput = z.infer<typeof createAdminSchema>;
export type LoginAdminInput = z.infer<typeof loginAdminSchema>;
