import { prisma } from "../prisma";
import { paginatedResult, type Pagination } from "../lib/pagination";
import type { CreateProductInput, UpdateProductInput } from "../schemas/product.schema";

export async function listProducts(pagination: Pagination) {
  const [items, total] = await prisma.$transaction([
    prisma.product.findMany({
      include: {
        category: true,
      },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      skip: (pagination.page - 1) * pagination.pageSize,
      take: pagination.pageSize,
    }),
    prisma.product.count(),
  ]);

  return paginatedResult(items, total, pagination);
}

export function getProduct(id: string) {
  return prisma.product.findUniqueOrThrow({
    where: { id },
    include: { category: true },
  });
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
