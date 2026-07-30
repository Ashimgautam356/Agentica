import { prisma } from "../prisma";
import type { CreateReviewInput } from "../schemas/review.schema";

export function listReviews() {
  return prisma.review.findMany({
    include: {
      product: true,
      user: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export function createReview(data: CreateReviewInput) {
  return prisma.review.create({
    data,
    include: {
      product: true,
      user: true,
    },
  });
}

export function deleteReview(id: string) {
  return prisma.review.delete({ where: { id } });
}
