"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, getApiError, type ApiResponse, type Paginated } from "@/lib/api";
import { ProductCard } from "./products/ProductCard";
import type { Product } from "./products/types";

export function BestReviewedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    api
      .get<ApiResponse<Paginated<Product>>>("/products", {
        signal: controller.signal,
        params: { pageSize: 100 },
      })
      .then((response) => {
        const bestReviewed = response.data.data.items
          .sort(
            (left, right) =>
              (right.averageRating ?? 0) - (left.averageRating ?? 0) ||
              (right.reviewCount ?? 0) - (left.reviewCount ?? 0),
          )
          .slice(0, 4);

        setProducts(bestReviewed);
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setError(getApiError(error, "Could not load the best reviewed products."));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, []);

  return (
    <section className="mx-auto max-w-282.5 px-4 py-12 min-[921px]:px-7 min-[921px]:py-16">
      <div className="text-center">
        <h2 className="m-0 text-[26px] leading-[1.1] font-extrabold text-[#1f2937] min-[921px]:text-[34px]">
          Best Reviewed Products
        </h2>
        <p className="mt-2 mb-0 text-xs text-[#7a8493] min-[921px]:text-sm">
          Rated highest by real customers - curated and cross-checked by our AI.
        </p>
      </div>

      {error ? (
        <p className="mt-8 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : (
        <div className="mt-8 grid gap-4 min-[640px]:grid-cols-2 min-[921px]:grid-cols-4 min-[921px]:gap-6">
          {isLoading
            ? Array.from({ length: 4 }, (_, index) => (
                <div className="h-65 animate-pulse rounded-md bg-[#eef4f1]" key={index} />
              ))
            : products.map((product) => <ProductCard product={product} key={product.id} />)}
        </div>
      )}

      {!isLoading && !error && products.length === 0 ? (
        <p className="mt-8 text-center text-sm font-semibold text-[#687487]">
          No products are available yet.
        </p>
      ) : null}

      <div className="mt-10 flex justify-center">
        <Link
          className="inline-flex h-10 min-w-39 items-center justify-center rounded-md border border-main-green px-6 text-sm font-extrabold text-[#16a34a] transition hover:bg-main-green hover:text-white"
          href="/products"
        >
          View All Products
        </Link>
      </div>
    </section>
  );
}
