"use client";

import { Minus, Plus, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { formatPrice } from "@/components/products/ProductCard";
import { ProductImage } from "@/components/products/ProductImage";
import { cartTotal, useCartStore } from "@/stores/cart-store";

type CartDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const items = useCartStore((state) => state.items);
  const hasHydrated = useCartStore((state) => state.hasHydrated);
  const hydrate = useCartStore((state) => state.hydrate);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const total = cartTotal(items);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <>
      <div
        className={`fixed inset-0 z-[120] bg-black/35 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed top-0 right-0 z-[130] flex h-dvh w-100 max-w-[92vw] flex-col bg-white shadow-[-20px_0_60px_rgba(9,39,68,0.18)] transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!isOpen}
        aria-label="Shopping cart"
      >
        <div className="flex h-20 items-center justify-between border-b border-[#e8e8e8] px-5">
          <div>
            <p className="text-xs font-bold text-[#16a34a]">Shopping Cart</p>
            <h2 className="text-xl font-extrabold text-text-dark">
              {items.length} {items.length === 1 ? "item" : "items"}
            </h2>
          </div>
          <button
            className="grid h-10 w-10 place-items-center rounded-full bg-[#eef8fb] text-text-dark transition hover:bg-[#dfffea] hover:text-nav-green"
            type="button"
            onClick={onClose}
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {!hasHydrated ? (
            <div className="h-40 rounded-md bg-[#eef4f1]" />
          ) : items.length === 0 ? (
            <div className="grid h-full place-items-center text-center">
              <div>
                <p className="text-base font-extrabold text-text-dark">Your cart is empty.</p>
                <Link
                  className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-main-green px-5 text-sm font-extrabold text-white transition hover:bg-main-green-hover"
                  href="/products"
                  onClick={onClose}
                >
                  Browse Products
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <article
                  className="grid grid-cols-[76px_1fr] gap-3 rounded-md border border-[#dfe6e3] bg-white p-3"
                  key={item.productId}
                >
                  <ProductImage
                    className="aspect-square rounded-md"
                    imageId={item.imageId}
                    name={item.name}
                  />
                  <div className="min-w-0">
                    <Link
                      className="line-clamp-2 text-sm font-extrabold text-text-dark hover:text-main-green"
                      href={`/products/${item.productId}`}
                      onClick={onClose}
                    >
                      {item.name}
                    </Link>
                    <p className="mt-1 text-sm font-extrabold text-[#16a34a]">
                      Rs {formatPrice(item.price)}
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="flex h-9 items-center overflow-hidden rounded-md border border-[#dfe6e3]">
                        <button
                          className="grid h-9 w-9 place-items-center text-text-dark disabled:opacity-40"
                          type="button"
                          disabled={item.quantity <= 1}
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          aria-label={`Decrease ${item.name} quantity`}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="grid h-9 min-w-9 place-items-center px-2 text-sm font-extrabold">
                          {item.quantity}
                        </span>
                        <button
                          className="grid h-9 w-9 place-items-center text-text-dark"
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          aria-label={`Increase ${item.name} quantity`}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <button
                        className="grid h-9 w-9 place-items-center rounded-md text-[#8b97a7] transition hover:bg-red-50 hover:text-red-600"
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {hasHydrated && items.length > 0 ? (
          <div className="border-t border-[#e8e8e8] p-5">
            <div className="flex items-center justify-between text-sm font-semibold text-[#526273]">
              <span>Subtotal</span>
              <span className="text-xl font-extrabold text-[#16a34a]">Rs {formatPrice(total)}</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                className="h-11 rounded-md border border-[#dfe6e3] text-sm font-extrabold text-[#526273] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                type="button"
                onClick={clearCart}
              >
                Clear
              </button>
              <button
                className="h-11 rounded-md bg-main-green px-5 text-sm font-extrabold text-white transition hover:bg-main-green-hover"
                type="button"
              >
                Checkout
              </button>
            </div>
          </div>
        ) : null}
      </aside>
    </>
  );
}
