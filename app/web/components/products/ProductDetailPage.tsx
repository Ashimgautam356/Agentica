"use client";

import { useEffect, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { api, getApiError, type ApiResponse } from "@/lib/api";
import { useCartStore } from "@/stores/cart-store";
import { ProductBreadcrumb } from "./ProductBreadcrumb";
import { formatPrice } from "./ProductCard";
import { ProductImage } from "./ProductImage";
import { ProductStars } from "./ProductStars";
import type { Product } from "./types";

type ProductDetailPageProps = {
  productId: string;
};

type ProductTab = "description" | "specifications" | "reviews";

export function ProductDetailPage({ productId }: ProductDetailPageProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<ProductTab>("description");
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
        setSelectedImageId(product.imageId);
        setQuantity(1);
        setActiveTab("description");

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

  const productImages = [product.imageId, product.imageId1, product.imageId2].filter(
    (imageId): imageId is string => Boolean(imageId),
  );
  const summaryDescription =
    product.description || "No description has been added for this product yet.";
  const longDescription =
    product.longDescription || "No description has been added for this product yet.";
  const specifications = Array.isArray(product.specifications) ? product.specifications : [];

  return (
    <main className="mx-auto max-w-[1200px] px-4 py-6 min-[921px]:px-7">
      <div className="mb-5">
        <ProductBreadcrumb
          current={product.name}
          parentLabel={product.category?.name ?? "All Products"}
          parentHref={`/products${product.categoryId ? `?categoryId=${product.categoryId}` : ""}`}
        />
      </div>

      <section className="grid gap-9 min-[900px]:grid-cols-[1fr_1.75fr]">
        <div>
          <ProductImage
            className="aspect-[1.78] rounded-md bg-[#eff4f1]"
            imageId={selectedImageId ?? product.imageId}
            name={product.name}
          />
          {productImages.length > 1 ? (
            <div className="mt-3 grid grid-cols-3 gap-3">
              {productImages.map((imageId) => (
                <button
                  aria-label={`Show ${product.name} image`}
                  className={`overflow-hidden rounded-md border transition ${
                    selectedImageId === imageId ? "border-main-green" : "border-transparent"
                  }`}
                  key={imageId}
                  onClick={() => setSelectedImageId(imageId)}
                  type="button"
                >
                  <ProductImage
                    className="aspect-[1.65] bg-[#eff4f1]"
                    imageId={imageId}
                    name={product.name}
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="pt-1">
          <h1 className="text-3xl leading-tight font-extrabold text-text-dark max-sm:text-2xl">
            {product.name}
          </h1>
          <div className="mt-3 flex items-center gap-2">
            <ProductStars rating={product.averageRating ?? 0} reviewCount={product.reviewCount} />
            <span className="text-xs font-medium text-[#7f8da0]">
              {(product.averageRating ?? 0).toFixed(1)} ({product.reviewCount ?? 0} reviews)
            </span>
          </div>
          <p className="mt-5 text-3xl font-extrabold text-[#16a34a]">
            Rs {formatPrice(product.price)}
          </p>
          <p className="mt-2 text-sm font-extrabold text-[#16a34a]">
            In stock • Ships within 24 hours
          </p>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-[#7b8798]">{summaryDescription}</p>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div className="flex h-11 items-center rounded-full border border-[#dfe6e3] bg-white">
              <button
                aria-label="Decrease quantity"
                className="grid size-11 place-items-center text-[#6c7787] transition hover:text-text-dark"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                type="button"
              >
                <Minus size={16} />
              </button>
              <span className="min-w-8 text-center text-sm font-extrabold text-text-dark">
                {quantity}
              </span>
              <button
                aria-label="Increase quantity"
                className="grid size-11 place-items-center text-[#6c7787] transition hover:text-text-dark"
                onClick={() => setQuantity((value) => value + 1)}
                type="button"
              >
                <Plus size={16} />
              </button>
            </div>
            <button
              className="h-11 min-w-36 rounded-full bg-main-green px-7 text-sm font-extrabold text-white transition hover:bg-main-green-hover"
              type="button"
              onClick={() => addItem(product, quantity)}
            >
              Add to Cart
            </button>
            <button
              className="h-11 rounded-full px-4 text-sm font-extrabold text-[#16a34a] transition hover:bg-[#eaf7ef]"
              type="button"
              onClick={() => addItem(product, quantity)}
            >
              Buy Now
            </button>
          </div>

          <div className="mt-5 rounded-md bg-[#e9f8ef] px-4 py-3 text-sm leading-6 text-[#647386]">
            <p>
              <span className="font-extrabold text-text-dark">
                Free delivery on orders above Rs 1,000
              </span>
              <br />
              Enjoy doorstep delivery with no extra shipping fee.
            </p>
            <p className="mt-1">
              <span className="font-extrabold text-text-dark">7-day easy returns</span>
              <br />
              Return unopened items within 7 days for a smooth refund.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8 border-b border-[#dfe6e3]">
        <div className="flex gap-8 overflow-x-auto">
          {[
            ["description", "Description"],
            ["specifications", "Specifications"],
            ["reviews", `Reviews (${product.reviewCount ?? 0})`],
          ].map(([tab, label]) => (
            <button
              className={`border-b-2 py-3 text-sm font-extrabold transition ${
                activeTab === tab
                  ? "border-main-green text-main-green"
                  : "border-transparent text-[#7f8da0]"
              }`}
              key={tab}
              onClick={() => setActiveTab(tab as ProductTab)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="min-h-28 py-5">
        {activeTab === "description" ? (
          <p className="max-w-3xl whitespace-pre-line text-sm leading-7 text-[#708096]">
            {longDescription}
          </p>
        ) : null}
        {activeTab === "specifications" ? (
          specifications.length > 0 ? (
            <div className="grid max-w-2xl overflow-hidden rounded-md border border-[#dfe6e3]">
              {specifications.map((specification) => (
                <div
                  className="grid grid-cols-[minmax(120px,0.45fr)_1fr] border-b border-[#dfe6e3] text-sm last:border-b-0 max-sm:grid-cols-1"
                  key={`${specification.label}-${specification.value}`}
                >
                  <span className="bg-[#f6faf8] px-4 py-3 font-extrabold text-text-dark">
                    {specification.label}
                  </span>
                  <span className="px-4 py-3 text-[#708096]">{specification.value}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm font-semibold text-[#708096]">
              No specifications have been added for this product yet.
            </p>
          )
        ) : null}
        {activeTab === "reviews" ? (
          <p className="text-sm font-semibold text-[#708096]">
            Customer reviews will appear here once they are added.
          </p>
        ) : null}
      </section>

      {related.length > 0 ? (
        <section className="mt-3">
          <h2 className="text-xl font-extrabold text-text-dark">You may also like</h2>
          <div className="mt-5 grid gap-4 min-[620px]:grid-cols-2 min-[1080px]:grid-cols-4">
            {related.map((item) => (
              <a
                className="rounded-md border border-[#dfe6e3] bg-white p-2 transition hover:-translate-y-0.5 hover:shadow-sm"
                href={`/products/${item.id}`}
                key={item.id}
              >
                <ProductImage
                  className="aspect-[2.25] rounded-md bg-[#eff4f1]"
                  imageId={item.imageId}
                  name={item.name}
                />
                <h3 className="mt-3 line-clamp-1 text-sm font-extrabold text-text-dark">
                  {item.name}
                </h3>
                <p className="mt-1 text-sm font-extrabold text-[#16a34a]">
                  Rs {formatPrice(item.price)}
                </p>
              </a>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
