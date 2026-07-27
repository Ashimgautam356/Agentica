import { prisma } from "../prisma";
import type { CreateCategoryInput, UpdateCategoryInput } from "../schemas/category.schema";

export function listCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
  });
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
