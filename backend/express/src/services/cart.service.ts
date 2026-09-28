import { prisma } from "../prisma";
import type { AddCartItemInput } from "../schemas/cart.schema";

const cartItemSelect = {
  productId: true,
  quantity: true,
  product: { select: { name: true, imageId: true, price: true } },
} as const;

export function cartUpsertData(userId: string, data: AddCartItemInput) {
  return {
    where: { userId_productId: { userId, productId: data.productId } },
    create: { userId, productId: data.productId, quantity: data.quantity },
    update: { quantity: { increment: data.quantity } },
  };
}

export async function getCart(userId: string) {
  const items = await prisma.cartItem.findMany({
    where: { userId },
    select: cartItemSelect,
    orderBy: { createdAt: "asc" },
  });
  return items.map(({ product, ...item }) => ({ ...item, ...product }));
}

export async function addItem(userId: string, data: AddCartItemInput) {
  await prisma.cartItem.upsert(cartUpsertData(userId, data));
  return getCart(userId);
}

export async function updateItem(userId: string, productId: string, quantity: number) {
  await prisma.cartItem.update({
    where: { userId_productId: { userId, productId } },
    data: { quantity },
  });
  return getCart(userId);
}

export async function removeItem(userId: string, productId: string) {
  await prisma.cartItem.deleteMany({ where: { userId, productId } });
  return getCart(userId);
}

export async function clearCart(userId: string) {
  await prisma.cartItem.deleteMany({ where: { userId } });
  return [];
}
