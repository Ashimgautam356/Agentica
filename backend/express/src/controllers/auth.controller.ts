import type { RequestHandler } from "express";
import { authCookie, clearAuthCookie } from "../lib/auth";
import { asyncHandler } from "../middleware/async-handler";
import * as authService from "../services/auth.service";

export const loginAdmin: RequestHandler = asyncHandler(async (request, response) => {
  const result = await authService.loginAdmin(request.body);

  authCookie(result.token, response);
  response.json({ success: true, data: { admin: result.admin, token: result.token } });
});

export const signupCustomer: RequestHandler = asyncHandler(async (request, response) => {
  const result = await authService.signupCustomer(request.body);

  authCookie(result.token, response);
  response.status(201).json({ success: true, data: result });
});

export const loginCustomer: RequestHandler = asyncHandler(async (request, response) => {
  const result = await authService.loginCustomer(request.body);

  authCookie(result.token, response);
  response.json({ success: true, data: result });
});

export const forgotCustomerPassword: RequestHandler = asyncHandler(async (request, response) => {
  const result = await authService.sendCustomerPasswordReset(request.body);

  response.status(202).json({ success: true, data: result });
});

export const getCurrentCustomer: RequestHandler = asyncHandler(async (_request, response) => {
  const customer = await authService.getCurrentCustomer(response.locals.customer.id);

  response.json({ success: true, data: customer });
});

export const resendCustomerEmailVerification: RequestHandler = asyncHandler(
  async (_request, response) => {
    const customer = await authService.sendCustomerEmailVerification(response.locals.customer.id);

    response.status(202).json({ success: true, data: customer });
  },
);

export const verifyCustomerEmail: RequestHandler = asyncHandler(async (request, response) => {
  const customer = await authService.verifyCustomerEmail(response.locals.customer.id, request.body);

  response.json({ success: true, data: customer });
});

export const createAdmin: RequestHandler = asyncHandler(async (request, response) => {
  const admin = await authService.createAdmin(response.locals.admin.id, request.body);

  response.status(201).json({ success: true, data: admin });
});

export const forgotAdminPassword: RequestHandler = asyncHandler(async (request, response) => {
  const result = await authService.sendAdminPasswordReset(request.body);

  response.status(202).json({ success: true, data: result });
});

export const resetAdminPassword: RequestHandler = asyncHandler(async (request, response) => {
  const result = await authService.resetAdminPassword(request.body);

  response.json({ success: true, data: result });
});

export const verifyAdminPasswordResetPin: RequestHandler = asyncHandler(
  async (request, response) => {
    const result = await authService.verifyAdminPasswordResetPin(request.body);

    response.json({ success: true, data: result });
  },
);

export const getCurrentAdmin: RequestHandler = asyncHandler(async (_request, response) => {
  const admin = await authService.getCurrentAdmin(response.locals.admin.id);

  response.json({ success: true, data: admin });
});

export const resendAdminEmailVerification: RequestHandler = asyncHandler(
  async (_request, response) => {
    const admin = await authService.sendAdminEmailVerification(response.locals.admin.id);

    response.status(202).json({ success: true, data: admin });
  },
);

export const verifyAdminEmail: RequestHandler = asyncHandler(async (request, response) => {
  const admin = await authService.verifyAdminEmail(response.locals.admin.id, request.body);

  response.json({ success: true, data: admin });
});

export const logoutAdmin: RequestHandler = (_request, response) => {
  clearAuthCookie(response);
  response.status(204).send();
};
