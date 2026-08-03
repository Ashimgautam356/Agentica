import { prisma } from "../prisma";
import { paginatedResult, type Pagination } from "../lib/pagination";
import type { CreateCategoryInput, UpdateCategoryInput } from "../schemas/category.schema";

export async function listCategories(pagination: Pagination) {
  const [items, total] = await prisma.$transaction([
    prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      skip: (pagination.page - 1) * pagination.pageSize,
      take: pagination.pageSize,
    }),
    prisma.category.count(),
  ]);

  return paginatedResult(items, total, pagination);
}

export function getCategory(id: string) {
  return prisma.category.findUniqueOrThrow({ where: { id } });
}

export function createCategory(data: CreateCategoryInput) {
  return prisma.category.create({ data });
}

export function updateCategory(id: string, data: UpdateCategoryInput) {
  return prisma.category.update({
    where: { id },
    data,
  });
}

export function deleteCategory(id: string) {
  return prisma.category.delete({ where: { id } });
}
