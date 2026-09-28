"use client";

import { create } from "zustand";
import type { Product } from "@/components/products/types";
import { api, getApiError, type ApiResponse } from "@/lib/api";

const cartStorageKey = "agentica_cart";
let latestMutation = 0;
let mutationQueue: Promise<void> = Promise.resolve();

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
  toastId: number;
  toastMessage: string;
  toastTone: "success" | "normal";
  addItem: (
    product: Pick<Product, "id" | "name" | "imageId" | "price">,
    quantity?: number,
  ) => Promise<boolean>;
  removeItem: (productId: string) => Promise<void>;
  dismissToast: () => void;
  showToast: (message: string, tone?: "success" | "normal") => void;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  hydrate: () => Promise<void>;
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  hasHydrated: false,
  toastId: 0,
  toastMessage: "",
  toastTone: "normal",

  async addItem(product, quantity = 1) {
    const mutation = ++latestMutation;
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

    set({
      items: nextItems,
      hasHydrated: true,
      toastId: get().toastId + 1,
      toastMessage: "Product added to cart successfully.",
      toastTone: "success",
    });
    if (!hasAuthToken()) {
      saveCart(nextItems);
      return true;
    }

    try {
      const response = await queueMutation(() =>
        api.post<ApiResponse<CartItem[]>>("/cart/items", {
          productId: product.id,
          quantity: safeQuantity,
        }),
      );
      if (mutation === latestMutation) set({ items: normalizeCart(response.data.data) });
      return true;
    } catch (error) {
      if (mutation === latestMutation) {
        set({
          items,
          toastMessage: getApiError(error, "Could not add the product to your cart."),
          toastTone: "normal",
        });
      }
      return false;
    }
  },

  async removeItem(productId) {
    const mutation = ++latestMutation;
    const items = get().items;
    const nextItems = get().items.filter((item) => item.productId !== productId);
    set({
      items: nextItems,
      hasHydrated: true,
      toastId: get().toastId + 1,
      toastMessage: "Product removed from cart successfully.",
      toastTone: "normal",
    });
    if (!hasAuthToken()) {
      saveCart(nextItems);
      return;
    }
    try {
      const response = await queueMutation(() =>
        api.delete<ApiResponse<CartItem[]>>(`/cart/items/${productId}`),
      );
      if (mutation === latestMutation) set({ items: normalizeCart(response.data.data) });
    } catch (error) {
      if (mutation === latestMutation) {
        set({ items, toastMessage: getApiError(error, "Could not remove this product.") });
      }
    }
  },

  dismissToast() {
    set({ toastMessage: "" });
  },

  showToast(message, tone = "normal") {
    set({
      toastId: get().toastId + 1,
      toastMessage: message,
      toastTone: tone,
    });
  },

  async updateQuantity(productId, quantity) {
    const mutation = ++latestMutation;
    const items = get().items;
    const nextItems = get()
      .items.map((item) =>
        item.productId === productId ? { ...item, quantity: Math.max(1, quantity) } : item,
      )
      .filter((item) => item.quantity > 0);

    set({ items: nextItems, hasHydrated: true });
    if (!hasAuthToken()) {
      saveCart(nextItems);
      return;
    }
    try {
      const response = await queueMutation(() =>
        api.patch<ApiResponse<CartItem[]>>(`/cart/items/${productId}`, {
          quantity: Math.max(1, quantity),
        }),
      );
      if (mutation === latestMutation) set({ items: normalizeCart(response.data.data) });
    } catch (error) {
      if (mutation === latestMutation) {
        set({ items, toastMessage: getApiError(error, "Could not update the cart.") });
      }
    }
  },

  async clearCart() {
    const mutation = ++latestMutation;
    const items = get().items;
    set({ items: [], hasHydrated: true });
    if (!hasAuthToken()) {
      saveCart([]);
      return;
    }
    try {
      await queueMutation(() => api.delete("/cart"));
    } catch (error) {
      if (mutation === latestMutation) {
        set({ items, toastMessage: getApiError(error, "Could not clear the cart.") });
      }
    }
  },

  async hydrate() {
    if (!hasAuthToken()) {
      latestMutation++;
      set({ items: readCart(), hasHydrated: true });
      return;
    }
    const mutation = latestMutation;
    try {
      const response = await api.get<ApiResponse<CartItem[]>>("/cart");
      if (mutation === latestMutation) {
        set({ items: normalizeCart(response.data.data), hasHydrated: true });
      }
    } catch (error) {
      if (mutation === latestMutation) {
        set({
          hasHydrated: true,
          toastMessage: getApiError(error, "Could not load your cart."),
          toastTone: "normal",
        });
      }
    }
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

function hasAuthToken() {
  return typeof window !== "undefined" && Boolean(window.localStorage.getItem("agentica_token"));
}

function normalizeCart(items: CartItem[]) {
  return items.map((item) => ({ ...item, price: Number(item.price) }));
}

function queueMutation<T>(request: () => Promise<T>) {
  const result = mutationQueue.then(request);
  mutationQueue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}
