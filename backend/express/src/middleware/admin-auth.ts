import type { RequestHandler } from "express";
import { ApiError } from "../errors/api-error";
import { readAuthCookie, verifyAuthToken } from "../lib/auth";
import { prisma } from "../prisma";

type AdminRole = "ADMIN" | "SUPER_ADMIN";

function requireRole(roles: AdminRole[]): RequestHandler {
  return (request, response, next) => {
    const bearerToken = request.header("authorization")?.replace(/^Bearer\s+/i, "");
    const cookieToken = readAuthCookie(request.header("cookie"));
    const token = bearerToken || cookieToken;

    if (token) {
      const admin = verifyAuthToken(token);

      if ((admin.role === "ADMIN" || admin.role === "SUPER_ADMIN") && roles.includes(admin.role)) {
        response.locals.admin = { id: admin.sub, role: admin.role };
        next();
        return;
      }

      next(new ApiError("FORBIDDEN"));
      return;
    }

    next(new ApiError("UNAUTHORIZED"));
  };
}

export const requireAdmin = requireRole(["ADMIN", "SUPER_ADMIN"]);
export const requireSuperAdmin = requireRole(["SUPER_ADMIN"]);

export const requireVerifiedAdmin: RequestHandler = async (request, response, next) => {
  void request;

  try {
    const adminId = response.locals.admin?.id;

    if (!adminId) {
      next(new ApiError("UNAUTHORIZED"));
      return;
    }

    const admin = await prisma.user.findUnique({
      where: { id: adminId },
      select: { emailVerifiedAt: true, role: true },
    });

    if (!admin?.emailVerifiedAt || (admin.role !== "ADMIN" && admin.role !== "SUPER_ADMIN")) {
      next(new ApiError("FORBIDDEN", "Verify your email before accessing admin resources."));
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};
