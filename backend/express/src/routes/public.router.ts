import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import * as categoryController from "../controllers/category.controller";
import * as emailController from "../controllers/email.controller";
import * as orderController from "../controllers/order.controller";
import * as paymentController from "../controllers/payment.controller";
import * as productController from "../controllers/product.controller";
import * as userController from "../controllers/user.controller";
import { ApiError } from "../errors/api-error";
import { requireCustomer } from "../middleware/customer-auth";
import { validate } from "../middleware/validate";
import {
  forgotCustomerPasswordSchema,
  loginCustomerSchema,
  signupCustomerSchema,
  verifyCustomerEmailSchema,
} from "../schemas/auth.schema";
import { categoryIdSchema } from "../schemas/category.schema";
import { contactEmailSchema } from "../schemas/email.schema";
import { createOrderSchema, orderIdSchema } from "../schemas/order.schema";
import { createPaymentSchema } from "../schemas/payment.schema";
import { listProductsQuerySchema, productIdSchema } from "../schemas/product.schema";
import {
  updateCustomerPasswordSchema,
  updateUserSchema,
  userIdSchema,
} from "../schemas/user.schema";

export const publicRouter = Router();

publicRouter.post(
  "/auth/signup",
  validate({ body: signupCustomerSchema }),
  authController.signupCustomer,
);
publicRouter.post(
  "/auth/login",
  validate({ body: loginCustomerSchema }),
  authController.loginCustomer,
);
publicRouter.post(
  "/auth/forgot-password",
  validate({ body: forgotCustomerPasswordSchema }),
  authController.forgotCustomerPassword,
);
publicRouter.get(
  "/products",
  validate({ query: listProductsQuerySchema }),
  productController.listProducts,
);
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
publicRouter.post(
  "/contact",
  validate({ body: contactEmailSchema }),
  emailController.sendContactEmail,
);

publicRouter.use(requireCustomer);

publicRouter.get("/auth/me", authController.getCurrentCustomer);
publicRouter.post("/auth/verify-email/resend", authController.resendCustomerEmailVerification);
publicRouter.post(
  "/auth/verify-email",
  validate({ body: verifyCustomerEmailSchema }),
  authController.verifyCustomerEmail,
);
publicRouter.post("/auth/api-key", userController.regenerateMyApiKey);
publicRouter.patch(
  "/auth/password",
  validate({ body: updateCustomerPasswordSchema }),
  userController.updateMyPassword,
);
publicRouter.get("/orders", orderController.listMyOrders);
publicRouter.post("/orders", validate({ body: createOrderSchema }), orderController.createOrder);
publicRouter.get("/orders/:id", validate({ params: orderIdSchema }), orderController.getMyOrder);
publicRouter.post(
  "/orders/:id/payments",
  validate({ params: orderIdSchema, body: createPaymentSchema }),
  paymentController.createPayment,
);
publicRouter.patch(
  "/users/:id",
  validate({ params: userIdSchema, body: updateUserSchema }),
  (request, response, next) => {
    if (request.params.id !== response.locals.customer.id) {
      next(new ApiError("FORBIDDEN"));
      return;
    }

    next();
  },
  userController.updateUser,
);
