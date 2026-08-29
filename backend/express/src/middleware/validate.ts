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

    for (const [key, schema] of Object.entries(schemas)) {
      const result = schema.safeParse(request[key as keyof RequestSchemas]);

      if (result.success) {
        if (key === "query") {
          Object.assign(request.query, result.data);
        } else {
          request[key as keyof RequestSchemas] = result.data;
        }
      } else {
        errors.push({ field: key, issues: result.error.issues });
      }
    }
    console.log("in the validation");
    if (errors.length > 0) {
      console.log("in the validation if error");
      next(new ApiError("VALIDATION_ERROR", "Validation failed.", errors));
      return;
    }

    next();
  };
}
