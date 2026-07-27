import { prisma } from "../prisma";
import type { CreateProductInput, UpdateProductInput } from "../schemas/product.schema";

export function listProducts() {
  return prisma.product.findMany({
    include: {
      category: true,
    },
    orderBy: { createdAt: "desc" },
  });
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
  return prisma.product.create({ data });
}

export function updateProduct(id: string, data: UpdateProductInput) {
  return prisma.product.update({
    where: { id },
    data,
  });
}

export function deleteProduct(id: string) {
  return prisma.product.delete({ where: { id } });
}
