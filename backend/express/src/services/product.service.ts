import type { Prisma } from "@prisma/client";
import { prisma } from "../prisma";
import { paginatedResult, type Pagination } from "../lib/pagination";
import type {
  CreateProductInput,
  ListProductsQueryInput,
  UpdateProductInput,
} from "../schemas/product.schema";

type ProductWithReviews = Awaited<ReturnType<typeof findProducts>>[number];

export async function listProducts(filters: ListProductsQueryInput, pagination: Pagination) {
  const products = await findProducts(filters);
  const filtered = products.map(withRating).filter((product) => {
    return filters.minRating === undefined || product.averageRating >= filters.minRating;
  });
  const start = (pagination.page - 1) * pagination.pageSize;

  return paginatedResult(
    filtered.slice(start, start + pagination.pageSize),
    filtered.length,
    pagination,
  );
}

function findProducts(filters: ListProductsQueryInput) {
  const search = filters.search?.trim();
  const where: Prisma.ProductWhereInput = {};

  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }

  if (filters.maxPrice) {
    where.price = { lte: filters.maxPrice };
  }

  if (search) {
    where.OR = [{ name: { contains: search, mode: "insensitive" } }, { tags: { has: search } }];
  }

  return prisma.product.findMany({
    where,
    include: {
      category: true,
      reviews: {
        select: { rating: true },
      },
    },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
  });
}

function withRating(product: ProductWithReviews) {
  const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
  const reviewCount = product.reviews.length;

  return {
    ...product,
    averageRating: reviewCount > 0 ? Number((totalRating / reviewCount).toFixed(1)) : 0,
    reviewCount,
  };
}

export async function getProduct(id: string) {
  const product = await prisma.product.findUniqueOrThrow({
    where: { id },
    include: {
      category: true,
      reviews: {
        select: { rating: true },
      },
    },
  });

  return withRating(product);
}

export function listProductsByCategory(categoryId: string) {
  return prisma.product.findMany({
    where: { categoryId },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
}

export function createProduct(data: CreateProductInput) {
  return prisma.product.create({
    data,
    include: { category: true },
  });
}

export function updateProduct(id: string, data: UpdateProductInput) {
  return prisma.product.update({
    where: { id },
    data,
    include: { category: true },
  });
}

export function deleteProduct(id: string) {
  return prisma.product.delete({ where: { id } });
}
