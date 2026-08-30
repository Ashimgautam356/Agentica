"use client";

import { create } from "zustand";
import type { Product } from "@/components/products/types";

const cartStorageKey = "agentica_cart";

export type CartItem = {
  productId: string;
  name: string;
  imageId: string;
  price: number;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  hasHydrated: boolean;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  hydrate: () => void;
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  hasHydrated: false,

  addItem(product, quantity = 1) {
    const items = get().items;
    const existing = items.find((item) => item.productId === product.id);
    const safeQuantity = Math.max(1, quantity);
    const nextItems = existing
      ? items.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + safeQuantity }
            : item,
        )
      : [
          ...items,
          {
            productId: product.id,
            name: product.name,
            imageId: product.imageId,
            price: Number(product.price),
            quantity: safeQuantity,
          },
        ];

    saveCart(nextItems);
    set({ items: nextItems });
  },

  removeItem(productId) {
    const nextItems = get().items.filter((item) => item.productId !== productId);
    saveCart(nextItems);
    set({ items: nextItems });
  },

  updateQuantity(productId, quantity) {
    const nextItems = get()
      .items.map((item) =>
        item.productId === productId ? { ...item, quantity: Math.max(1, quantity) } : item,
      )
      .filter((item) => item.quantity > 0);

    saveCart(nextItems);
    set({ items: nextItems });
  },

  clearCart() {
    saveCart([]);
    set({ items: [] });
  },

  hydrate() {
    set({ items: readCart(), hasHydrated: true });
  },
}));

export function cartItemCount(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function cartTotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function readCart() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const value = window.localStorage.getItem(cartStorageKey);
    return value ? (JSON.parse(value) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(cartStorageKey, JSON.stringify(items));
  }
}
