import type { ErrorRequestHandler, RequestHandler } from "express";
import { ApiError, errorBody } from "./api-error";
import { mapPrismaError } from "./prisma-error";

export const notFoundHandler: RequestHandler = (request, _response, next) => {
  next(new ApiError("NOT_FOUND", `Route ${request.method} ${request.path} not found.`));
};

export const errorHandler: ErrorRequestHandler = (error, _request, response, next) => {
  void next;

  const apiError =
    error instanceof ApiError
      ? error
      : (mapPrismaError(error) ?? new ApiError("INTERNAL_SERVER_ERROR", "Internal server error."));

  response.status(apiError.statusCode).json(errorBody(apiError));
};
