import type { RequestHandler } from "express";
import { ApiError } from "../errors/api-error";
import { readAuthCookie, verifyAuthToken } from "../lib/auth";

type AdminRole = "ADMIN" | "SUPER_ADMIN";

function requireRole(roles: AdminRole[]): RequestHandler {
  return (request, response, next) => {
    const cookieToken = readAuthCookie(request.header("cookie"));

    if (cookieToken) {
      const admin = verifyAuthToken(cookieToken);

      if (roles.includes(admin.role)) {
        response.locals.admin = { id: admin.sub, role: admin.role };
        next();
        return;
      }

      next(new ApiError("FORBIDDEN"));
      return;
    }

    const token = request.header("authorization")?.replace(/^Bearer\s+/i, "");
    const legacyAdminToken = process.env.ADMIN_TOKEN;

    if (legacyAdminToken && token === legacyAdminToken) {
      response.locals.admin = { id: "", role: "SUPER_ADMIN" };
      next();
      return;
    }

    next(new ApiError("UNAUTHORIZED"));
  };
}

export const requireAdmin = requireRole(["ADMIN", "SUPER_ADMIN"]);
export const requireSuperAdmin = requireRole(["SUPER_ADMIN"]);

export const requireLegacyAdmin: RequestHandler = (request, _response, next) => {
  const adminToken = process.env.ADMIN_TOKEN;

  if (!adminToken) {
    next();
    return;
  }

  const token = request.header("authorization")?.replace(/^Bearer\s+/i, "");

  if (token === adminToken) {
    next();
    return;
  }

  next(new ApiError("UNAUTHORIZED"));
};
