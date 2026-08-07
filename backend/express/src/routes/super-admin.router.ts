import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import * as userController from "../controllers/user.controller";
import { requireSuperAdmin, requireVerifiedAdmin } from "../middleware/admin-auth";
import { validate } from "../middleware/validate";
import { createAdminSchema, updateAdminSchema } from "../schemas/auth.schema";
import { userIdSchema } from "../schemas/user.schema";

export const superAdminRouter = Router();

superAdminRouter.use(requireSuperAdmin, requireVerifiedAdmin);

superAdminRouter.get("/admins", userController.listAdmins);
superAdminRouter.post("/admins", validate({ body: createAdminSchema }), authController.createAdmin);
superAdminRouter.patch(
  "/admins/:id",
  validate({ params: userIdSchema, body: updateAdminSchema }),
  userController.updateAdmin,
);

superAdminRouter.delete(
  "/admins/:id",
  validate({ params: userIdSchema }),
  userController.deleteAdmin,
);
