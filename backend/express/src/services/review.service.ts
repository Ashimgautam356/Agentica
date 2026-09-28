import { ApiError } from "../errors/api-error";
import { prisma } from "../prisma";
import { paginatedResult, type Pagination } from "../lib/pagination";
import type {
  CreateProductReviewInput,
  CreateReviewInput,
  ListProductReviewsQueryInput,
} from "../schemas/review.schema";

export async function listReviews(pagination: Pagination) {
  const [items, total] = await prisma.$transaction([
    prisma.review.findMany({
      include: {
        product: {
          include: { category: true },
        },
        user: true,
      },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      skip: (pagination.page - 1) * pagination.pageSize,
      take: pagination.pageSize,
    }),
    prisma.review.count(),
  ]);

  return paginatedResult(items, total, pagination);
}

export function createReview(data: CreateReviewInput) {
  return prisma.review.create({
    data,
    include: {
      product: {
        include: { category: true },
      },
      user: true,
    },
  });
}

export async function listProductReviews(
  productId: string,
  query: ListProductReviewsQueryInput,
  pagination: Pagination,
) {
  const orderBy = {
    "rating-desc": [{ rating: "desc" as const }, { createdAt: "desc" as const }],
    "rating-asc": [{ rating: "asc" as const }, { createdAt: "desc" as const }],
    newest: [{ createdAt: "desc" as const }],
    oldest: [{ createdAt: "asc" as const }],
  }[query.sort];
  const where = { productId };
  const [items, total] = await prisma.$transaction([
    prisma.review.findMany({
      where,
      select: {
        id: true,
        rating: true,
        description: true,
        createdAt: true,
        user: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy,
      skip: (pagination.page - 1) * pagination.pageSize,
      take: pagination.pageSize,
    }),
    prisma.review.count({ where }),
  ]);

  return paginatedResult(items, total, pagination);
}

export function createProductReview(
  userId: string,
  productId: string,
  data: CreateProductReviewInput,
) {
  return prisma.review.create({
    data: { ...data, userId, productId },
    select: {
      id: true,
      rating: true,
      description: true,
      createdAt: true,
      user: { select: { id: true, firstName: true, lastName: true } },
    },
  });
}

export async function deleteProductReview(reviewId: string, productId: string, userId: string) {
  const result = await prisma.review.deleteMany({
    where: { id: reviewId, productId, userId },
  });

  if (result.count === 0) {
    throw new ApiError("NOT_FOUND", "Review not found or does not belong to you.");
  }
}

export function deleteReview(id: string) {
  return prisma.review.delete({ where: { id } });
}
