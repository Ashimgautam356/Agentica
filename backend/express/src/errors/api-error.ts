export const errorResponses = {
  BAD_REQUEST: { statusCode: 400, message: "Invalid request." },
  VALIDATION_ERROR: { statusCode: 422, message: "Validation failed." },
  UNAUTHORIZED: { statusCode: 401, message: "Authentication required." },
  INVALID_CREDENTIALS: { statusCode: 401, message: "Invalid email or password." },
  FORBIDDEN: { statusCode: 403, message: "You do not have permission to do this." },
  NOT_FOUND: { statusCode: 404, message: "Resource not found." },
  CONFLICT: { statusCode: 409, message: "Resource already exists." },
  SESSION_EXPIRED: { statusCode: 401, message: "Session expired." },
  DATABASE_ERROR: { statusCode: 500, message: "Database error." },
  INTERNAL_SERVER_ERROR: { statusCode: 500, message: "Internal server error." },
} as const;

export type ErrorCode = keyof typeof errorResponses;

export class ApiError extends Error {
  readonly code: ErrorCode;
  readonly statusCode: number;
  readonly details: unknown;

  constructor(
    code: ErrorCode,
    message: string = errorResponses[code].message,
    details: unknown = null,
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.statusCode = errorResponses[code].statusCode;
    this.details = details;
  }
}

export function errorBody(error: ApiError) {
  return {
    success: false,
    error: {
      code: error.code,
      message: error.message,
      details: error.details,
    },
  };
}
