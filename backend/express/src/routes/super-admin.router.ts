import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import * as userController from "../controllers/user.controller";
import { requireSuperAdmin } from "../middleware/admin-auth";
import { validate } from "../middleware/validate";
import { createAdminSchema } from "../schemas/auth.schema";
import { userIdSchema } from "../schemas/user.schema";

export const superAdminRouter = Router();

superAdminRouter.use(requireSuperAdmin);

superAdminRouter.post("/admins", validate({ body: createAdminSchema }), authController.createAdmin);

superAdminRouter.delete(
  "/admins/:id",
  validate({ params: userIdSchema }),
  userController.deleteAdmin,
);
