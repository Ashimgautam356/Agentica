import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import * as categoryController from "../controllers/category.controller";
import * as chatController from "../controllers/chat.controller";
import * as emailController from "../controllers/email.controller";
import * as orderController from "../controllers/order.controller";
import * as notificationController from "../controllers/notification.controller";
import * as paymentController from "../controllers/payment.controller";
import * as productController from "../controllers/product.controller";
import * as reviewController from "../controllers/review.controller";
import * as testimonialController from "../controllers/testimonial.controller";
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
import { chatSessionParamsSchema, sendChatMessageSchema } from "../schemas/chat.schema";
import { contactEmailSchema } from "../schemas/email.schema";
import { createOrderSchema, orderIdSchema } from "../schemas/order.schema";
import { notificationIdSchema } from "../schemas/notification.schema";
import { processPaymentSchema } from "../schemas/payment.schema";
import { listProductsQuerySchema, productIdSchema } from "../schemas/product.schema";
import {
  createProductReviewSchema,
  customerReviewParamsSchema,
  listProductReviewsQuerySchema,
} from "../schemas/review.schema";
import { createTestimonialSchema } from "../schemas/testimonial.schema";
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
publicRouter.get(
  "/products/:id/reviews",
  validate({ params: productIdSchema, query: listProductReviewsQuerySchema }),
  reviewController.listProductReviews,
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
publicRouter.get("/testimonials", testimonialController.listTestimonials);

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
publicRouter.get("/notifications", notificationController.listMyNotifications);
publicRouter.get("/notifications/unread-count", notificationController.getMyUnreadCount);
publicRouter.patch("/notifications/read-all", notificationController.markAllMyNotificationsRead);
publicRouter.patch(
  "/notifications/:id/read",
  validate({ params: notificationIdSchema }),
  notificationController.markMyNotificationRead,
);
publicRouter.get("/testimonials/me", testimonialController.getMyTestimonial);
publicRouter.post(
  "/chat/:sessionId/message",
  validate({ params: chatSessionParamsSchema, body: sendChatMessageSchema }),
  chatController.sendMessage,
);
publicRouter.get(
  "/chat/:sessionId",
  validate({ params: chatSessionParamsSchema }),
  chatController.getConversation,
);
publicRouter.get(
  "/chat/:sessionId/summary",
  validate({ params: chatSessionParamsSchema }),
  chatController.getSummary,
);
publicRouter.post(
  "/products/:id/reviews",
  validate({ params: productIdSchema, body: createProductReviewSchema }),
  reviewController.createProductReview,
);
publicRouter.delete(
  "/products/:id/reviews/:reviewId",
  validate({ params: customerReviewParamsSchema }),
  reviewController.deleteProductReview,
);
publicRouter.post(
  "/testimonials",
  validate({ body: createTestimonialSchema }),
  testimonialController.createTestimonial,
);
publicRouter.post("/orders", validate({ body: createOrderSchema }), orderController.createOrder);
publicRouter.get("/orders/:id", validate({ params: orderIdSchema }), orderController.getMyOrder);
publicRouter.patch(
  "/orders/:id/cancel",
  validate({ params: orderIdSchema }),
  orderController.cancelMyOrder,
);
publicRouter.get("/payments", paymentController.listMyPayments);
publicRouter.post(
  "/payments/process",
  validate({ body: processPaymentSchema }),
  paymentController.processPayment,
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
