import type { RequestHandler } from "express";
import { ApiError } from "../errors/api-error";
import { readAuthCookie, verifyAuthToken } from "../lib/auth";
import { prisma } from "../prisma";

export const requireCustomer: RequestHandler = async (request, response, next) => {
  try {
    const apiKey = request.header("x-api-key");

    if (apiKey) {
      const customer = await prisma.user.findFirst({
        where: { apiKey, role: "CUSTOMER" },
        select: { id: true },
      });

      if (!customer) {
        next(new ApiError("UNAUTHORIZED"));
        return;
      }

      response.locals.customer = { id: customer.id, role: "CUSTOMER" };
      next();
      return;
    }

    const bearerToken = request.header("authorization")?.replace(/^Bearer\s+/i, "");
    const cookieToken = readAuthCookie(request.header("cookie"));
    const token = bearerToken || cookieToken;

    if (!token) {
      next(new ApiError("UNAUTHORIZED"));
      return;
    }

    const user = verifyAuthToken(token);

    if (user.role !== "CUSTOMER") {
      next(new ApiError("FORBIDDEN"));
      return;
    }

    response.locals.customer = { id: user.sub, role: user.role };
    next();
  } catch (error) {
    next(error);
  }
};
