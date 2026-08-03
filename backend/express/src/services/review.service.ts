import { prisma } from "../prisma";
import { paginatedResult, type Pagination } from "../lib/pagination";
import type { CreateReviewInput } from "../schemas/review.schema";

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

export function deleteReview(id: string) {
  return prisma.review.delete({ where: { id } });
}
