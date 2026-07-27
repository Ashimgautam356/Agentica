import { ApiError } from "./api-error";

type PrismaKnownError = {
  code?: string;
  meta?: unknown;
};

export function mapPrismaError(error: unknown) {
  const prismaError = error as PrismaKnownError;

  if (prismaError.code === "P2002") {
    return new ApiError("CONFLICT", "Resource already exists.", prismaError.meta ?? null);
  }

  if (prismaError.code === "P2025") {
    return new ApiError("NOT_FOUND", "Resource not found.");
  }

  return null;
}
