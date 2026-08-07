import type { RequestHandler } from "express";
import { authCookie, clearAuthCookie } from "../lib/auth";
import { asyncHandler } from "../middleware/async-handler";
import * as authService from "../services/auth.service";

export const loginAdmin: RequestHandler = asyncHandler(async (request, response) => {
  const result = await authService.loginAdmin(request.body);

  authCookie(result.token, response);
  response.json({ success: true, data: { admin: result.admin, token: result.token } });
});

export const createAdmin: RequestHandler = asyncHandler(async (request, response) => {
  const admin = await authService.createAdmin(response.locals.admin.id, request.body);

  response.status(201).json({ success: true, data: admin });
});

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
