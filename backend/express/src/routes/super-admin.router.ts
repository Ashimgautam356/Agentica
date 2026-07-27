import { Router } from "express";
import * as userController from "../controllers/user.controller";
import { validate } from "../middleware/validate";
import { userIdSchema } from "../schemas/user.schema";

export const superAdminRouter = Router();

superAdminRouter.delete(
  "/admins/:id",
  validate({ params: userIdSchema }),
  userController.deleteAdmin,
);
