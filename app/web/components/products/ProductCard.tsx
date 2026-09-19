"use client";

import Link from "next/link";
import { useCartStore } from "@/stores/cart-store";
import { ProductImage } from "./ProductImage";
import { ProductStars } from "./ProductStars";
import type { Product } from "./types";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);

  return (
    <article className="rounded-md border border-[#dfe6e3] bg-white p-3 transition hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(9,39,68,0.08)]">
      <Link className="block" href={`/products/${product.id}`} aria-label={`View ${product.name}`}>
        <ProductImage
          className="aspect-[1.55] rounded-md"
          imageId={product.imageId}
          name={product.name}
        />
        <h2 className="mt-4 line-clamp-2 min-h-10 text-sm leading-5 font-extrabold text-[#111827]">
          {product.name}
        </h2>
      </Link>

      <div className="mt-1">
        <ProductStars rating={product.averageRating ?? 0} reviewCount={product.reviewCount} />
      </div>

      <p className="mt-1 text-lg font-extrabold text-[#16a34a]">Rs {formatPrice(product.price)}</p>

      <button
        className="mt-2 flex h-9 w-full cursor-pointer items-center justify-center rounded-md border-0 bg-[#e8f8ed] text-xs font-extrabold text-[#16a34a] transition hover:bg-main-green hover:text-white"
        type="button"
        onClick={() => addItem(product)}
      >
        Add to Cart
      </button>
    </article>
  );
}

export function formatPrice(price: string | number) {
  return Number(price).toLocaleString("en-US", { maximumFractionDigits: 0 });
}
