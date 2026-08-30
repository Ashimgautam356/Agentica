import type { RequestHandler } from "express";
import type { ZodType } from "zod";
import { ApiError } from "../errors/api-error";

type RequestSchemas = {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
};

export function validate(schemas: RequestSchemas): RequestHandler {
  return (request, _response, next) => {
    const errors: unknown[] = [];

    try {
      if (schemas.body) {
        const result = schemas.body.safeParse(request.body);

        if (result.success) {
          request.body = result.data;
        } else {
          errors.push({ field: "body", issues: result.error.issues });
        }
      }

      if (schemas.params) {
        const result = schemas.params.safeParse(request.params);

        if (result.success) {
          Object.assign(request.params, result.data);
        } else {
          errors.push({ field: "params", issues: result.error.issues });
        }
      }

      if (schemas.query) {
        const result = schemas.query.safeParse(request.query);

        if (result.success) {
          Object.assign(request.query, result.data);
        } else {
          errors.push({ field: "query", issues: result.error.issues });
        }
      }
    } catch (error) {
      next(error);
      return;
    }

    if (errors.length > 0) {
      next(new ApiError("VALIDATION_ERROR", "Validation failed.", errors));
      return;
    }

    next();
  };
}
