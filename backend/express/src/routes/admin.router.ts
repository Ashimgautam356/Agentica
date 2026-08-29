import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import * as categoryController from "../controllers/category.controller";
import * as emailController from "../controllers/email.controller";
import * as orderController from "../controllers/order.controller";
import * as paymentController from "../controllers/payment.controller";
import * as productController from "../controllers/product.controller";
import * as reviewController from "../controllers/review.controller";
import * as userController from "../controllers/user.controller";
import { requireAdmin, requireVerifiedAdmin } from "../middleware/admin-auth";
import { validate } from "../middleware/validate";
import {
  forgotAdminPasswordSchema,
  loginAdminSchema,
  resetAdminPasswordSchema,
  verifyAdminPasswordResetPinSchema,
  verifyAdminEmailSchema,
} from "../schemas/auth.schema";
import {
  categoryIdSchema,
  createCategorySchema,
  updateCategorySchema,
} from "../schemas/category.schema";
import { sendEmailSchema } from "../schemas/email.schema";
import { orderIdSchema, updateOrderStatusSchema } from "../schemas/order.schema";
import { paymentIdSchema, updatePaymentStatusSchema } from "../schemas/payment.schema";
import {
  createProductSchema,
  listProductsQuerySchema,
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
adminRouter.post(
  "/forgot-password",
  validate({ body: forgotAdminPasswordSchema }),
  authController.forgotAdminPassword,
);
adminRouter.post(
  "/reset-password",
  validate({ body: resetAdminPasswordSchema }),
  authController.resetAdminPassword,
);
adminRouter.post(
  "/reset-password/verify-pin",
  validate({ body: verifyAdminPasswordResetPinSchema }),
  authController.verifyAdminPasswordResetPin,
);
adminRouter.post("/logout", authController.logoutAdmin);

adminRouter.use(requireAdmin);

adminRouter.get("/me", authController.getCurrentAdmin);
adminRouter.post(
  "/verify-email",
  validate({ body: verifyAdminEmailSchema }),
  authController.verifyAdminEmail,
);
adminRouter.post("/verify-email/resend", authController.resendAdminEmailVerification);

adminRouter.use(requireVerifiedAdmin);

adminRouter.post("/email", validate({ body: sendEmailSchema }), emailController.sendEmail);

adminRouter.get(
  "/products",
  validate({ query: listProductsQuerySchema }),
  productController.listProducts,
);
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

adminRouter.get("/orders", orderController.listOrders);
adminRouter.get("/orders/:id", validate({ params: orderIdSchema }), orderController.getOrder);
adminRouter.patch(
  "/orders/:id/status",
  validate({ params: orderIdSchema, body: updateOrderStatusSchema }),
  orderController.updateOrderStatus,
);

adminRouter.get("/payments", paymentController.listPayments);
adminRouter.get(
  "/payments/:id",
  validate({ params: paymentIdSchema }),
  paymentController.getPayment,
);
adminRouter.patch(
  "/payments/:id/status",
  validate({ params: paymentIdSchema, body: updatePaymentStatusSchema }),
  paymentController.updatePaymentStatus,
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
adminRouter.patch(
  "/customers/:id/api-key/disable",
  validate({ params: userIdSchema }),
  userController.disableUserApiKey,
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
