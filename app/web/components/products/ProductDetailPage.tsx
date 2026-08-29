"use client";

import { useEffect, useState } from "react";
import { api, getApiError, type ApiResponse } from "@/lib/api";
import { ProductBreadcrumb } from "./ProductBreadcrumb";
import { ProductCard, formatPrice } from "./ProductCard";
import { ProductImage } from "./ProductImage";
import { ProductStars } from "./ProductStars";
import type { Product } from "./types";

type ProductDetailPageProps = {
  productId: string;
};

export function ProductDetailPage({ productId }: ProductDetailPageProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchProduct() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await api.get<ApiResponse<Product>>(`/products/${productId}`, {
          signal: controller.signal,
        });
        const product = response.data.data;
        setProduct(product);

        if (product.categoryId) {
          const relatedResponse = await api.get<ApiResponse<{ items: Product[] }>>("/products", {
            signal: controller.signal,
            params: { categoryId: product.categoryId, pageSize: 4 },
          });
          setRelated(relatedResponse.data.data.items.filter((item) => item.id !== product.id));
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setError(getApiError(error, "Could not load product."));
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void fetchProduct();

    return () => controller.abort();
  }, [productId]);

  if (isLoading) {
    return (
      <main className="mx-auto min-h-[60vh] max-w-282.5 px-4 py-10 min-[921px]:px-7">
        <div className="h-100 rounded-md bg-[#eef4f1]" />
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="mx-auto min-h-[60vh] max-w-282.5 px-4 py-10 min-[921px]:px-7">
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error ?? "Product not found."}
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-282.5 px-4 py-8 min-[921px]:px-7">
      <div className="mb-5">
        <ProductBreadcrumb current={product.name} parentHref="/products" />
      </div>

      <section className="grid gap-8 min-[900px]:grid-cols-[1fr_0.9fr]">
        <ProductImage
          className="aspect-[1.25] rounded-md border border-[#dfe6e3]"
          imageId={product.imageId}
          name={product.name}
        />
        <div>
          <p className="text-sm font-bold text-[#16a34a]">{product.category?.name}</p>
          <h1 className="mt-2 text-3xl leading-tight font-extrabold text-text-dark">
            {product.name}
          </h1>
          <div className="mt-3">
            <ProductStars rating={product.averageRating ?? 0} reviewCount={product.reviewCount} />
          </div>
          <p className="mt-5 text-3xl font-extrabold text-[#16a34a]">
            Rs {formatPrice(product.price)}
          </p>
          <div className="mt-6 space-y-3 text-sm leading-6 text-[#526273]">
            {(product.description.length > 0
              ? product.description
              : ["No description has been added for this product yet."]
            ).map((description) => (
              <p key={description}>{description}</p>
            ))}
          </div>
          <button
            className="mt-8 h-11 w-full rounded-md bg-main-green px-6 text-sm font-extrabold text-white transition hover:bg-main-green-hover min-[520px]:w-auto"
            type="button"
          >
            Add to Cart
          </button>
        </div>
      </section>

      {related.length > 0 ? (
        <section className="mt-12">
          <h2 className="text-2xl font-extrabold text-text-dark">Related Products</h2>
          <div className="mt-5 grid gap-4 min-[620px]:grid-cols-2 min-[1080px]:grid-cols-4">
            {related.map((item) => (
              <ProductCard product={item} key={item.id} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
