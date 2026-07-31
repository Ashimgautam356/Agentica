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

  if (prismaError.code === "P2003") {
    return new ApiError("CONFLICT", "Resource is still in use.", prismaError.meta ?? null);
  }

  if (prismaError.code === "P2022") {
    return new ApiError(
      "DATABASE_ERROR",
      "Database schema is out of sync. Run Prisma db push or migrations.",
      prismaError.meta ?? null,
    );
  }

  return null;
}
