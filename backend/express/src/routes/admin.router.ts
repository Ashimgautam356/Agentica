import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import * as categoryController from "../controllers/category.controller";
import * as emailController from "../controllers/email.controller";
import * as productController from "../controllers/product.controller";
import * as reviewController from "../controllers/review.controller";
import * as userController from "../controllers/user.controller";
import { requireAdmin } from "../middleware/admin-auth";
import { validate } from "../middleware/validate";
import { loginAdminSchema } from "../schemas/auth.schema";
import {
  categoryIdSchema,
  createCategorySchema,
  updateCategorySchema,
} from "../schemas/category.schema";
import { sendEmailSchema } from "../schemas/email.schema";
import {
  createProductSchema,
  productIdSchema,
  updateProductSchema,
} from "../schemas/product.schema";
import { reviewIdSchema } from "../schemas/review.schema";
import {
  updateUserPasswordSchema,
  updateUserSchema,
  userIdSchema,
  userSessionIdSchema,
} from "../schemas/user.schema";

export const adminRouter = Router();

adminRouter.post("/login", validate({ body: loginAdminSchema }), authController.loginAdmin);
adminRouter.post("/logout", authController.logoutAdmin);

adminRouter.use(requireAdmin);

adminRouter.get("/me", authController.getCurrentAdmin);
adminRouter.post("/email", validate({ body: sendEmailSchema }), emailController.sendEmail);

adminRouter.get("/products", productController.listProducts);
adminRouter.post(
  "/products",
  validate({ body: createProductSchema }),
  productController.createProduct,
);
adminRouter.get(
  "/products/:id",
  validate({ params: productIdSchema }),
  productController.getProduct,
);
adminRouter.patch(
  "/products/:id",
  validate({ params: productIdSchema, body: updateProductSchema }),
  productController.updateProduct,
);
adminRouter.delete(
  "/products/:id",
  validate({ params: productIdSchema }),
  productController.deleteProduct,
);

adminRouter.get("/reviews", reviewController.listReviews);
adminRouter.delete(
  "/reviews/:id",
  validate({ params: reviewIdSchema }),
  reviewController.deleteReview,
);

adminRouter.get("/customers", userController.listCustomers);
adminRouter.get("/customers/:id", validate({ params: userIdSchema }), userController.getCustomer);
adminRouter.patch(
  "/customers/:id",
  validate({ params: userIdSchema, body: updateUserSchema }),
  userController.updateUser,
);
adminRouter.patch(
  "/customers/:id/password",
  validate({ params: userIdSchema, body: updateUserPasswordSchema }),
  userController.updateUserPassword,
);
adminRouter.delete(
  "/customers/:id/sessions/:sessionId",
  validate({ params: userSessionIdSchema }),
  userController.deleteUserSession,
);
adminRouter.delete("/customers/:id", validate({ params: userIdSchema }), userController.deleteUser);

adminRouter.get("/categories", categoryController.listCategories);
adminRouter.post(
  "/categories",
  validate({ body: createCategorySchema }),
  categoryController.createCategory,
);
adminRouter.get(
  "/categories/:id",
  validate({ params: categoryIdSchema }),
  categoryController.getCategory,
);
adminRouter.patch(
  "/categories/:id",
  validate({ params: categoryIdSchema, body: updateCategorySchema }),
  categoryController.updateCategory,
);
adminRouter.delete(
  "/categories/:id",
  validate({ params: categoryIdSchema }),
  categoryController.deleteCategory,
);
