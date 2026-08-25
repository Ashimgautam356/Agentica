import { paginatedResult, type Pagination } from "../lib/pagination";
import { prisma } from "../prisma";
import type { CreateStockInput, UpdateStockInput } from "../schemas/stock.schema";

export async function listStocks(pagination: Pagination) {
  const [items, total] = await prisma.$transaction([
    prisma.stock.findMany({
      include: { product: { include: { category: true } } },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      skip: (pagination.page - 1) * pagination.pageSize,
      take: pagination.pageSize,
    }),
    prisma.stock.count(),
  ]);

  return paginatedResult(items, total, pagination);
}

export function getStock(id: string) {
  return prisma.stock.findUniqueOrThrow({
    where: { id },
    include: { product: { include: { category: true } } },
  });
}

export function createStock(data: CreateStockInput) {
  return prisma.stock.create({
    data,
    include: { product: { include: { category: true } } },
  });
}

export function updateStock(id: string, data: UpdateStockInput) {
  return prisma.stock.update({
    where: { id },
    data,
    include: { product: { include: { category: true } } },
  });
}

export function deleteStock(id: string) {
  return prisma.stock.delete({ where: { id } });
}
