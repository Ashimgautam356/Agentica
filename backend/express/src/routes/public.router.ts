import { Router } from "express";
import * as categoryController from "../controllers/category.controller";
import * as productController from "../controllers/product.controller";
import * as userController from "../controllers/user.controller";
import { validate } from "../middleware/validate";
import { categoryIdSchema } from "../schemas/category.schema";
import { productIdSchema } from "../schemas/product.schema";
import { updateUserSchema, userIdSchema } from "../schemas/user.schema";

export const publicRouter = Router();

publicRouter.get("/products", productController.listProducts);
publicRouter.get(
  "/products/:id",
  validate({ params: productIdSchema }),
  productController.getProduct,
);
publicRouter.get("/categories", categoryController.listCategories);
publicRouter.get(
  "/categories/:id/products",
  validate({ params: categoryIdSchema }),
  productController.listProductsByCategory,
);
publicRouter.patch(
  "/users/:id",
  validate({ params: userIdSchema, body: updateUserSchema }),
  userController.updateUser,
);
