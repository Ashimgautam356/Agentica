"use client";

import { useEffect, useMemo, useState } from "react";
import { api, getApiError, type ApiResponse, type Paginated } from "@/lib/api";
import { useCategoryStore } from "@/stores/category-store";
import { ProductSearchBar } from "@/components/ProductSearchBar";
import { ProductBreadcrumb } from "./ProductBreadcrumb";
import { ProductFilters } from "./ProductFilters";
import { ProductGrid } from "./ProductGrid";
import { ProductPagination } from "./ProductPagination";
import { ProductSortSelect } from "./ProductSortSelect";
import type { Product, ProductSort } from "./types";

const pageSize = 8;

export function ProductsPage() {
  const { categories, fetchCategories } = useCategoryStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [maxPrice, setMaxPrice] = useState(5000);
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState<ProductSort>("rating-desc");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchProducts() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await api.get<ApiResponse<Paginated<Product>>>("/products", {
          signal: controller.signal,
          params: {
            page,
            pageSize,
            search: search || undefined,
            categoryId: selectedCategoryId || undefined,
            maxPrice: maxPrice < 5000 ? maxPrice : undefined,
            minRating: minRating || undefined,
          },
        });

        setProducts(response.data.data.items);
        setTotal(response.data.data.total);
        setTotalPages(response.data.data.totalPages);
      } catch (error) {
        if (!controller.signal.aborted) {
          setError(getApiError(error, "Could not load products."));
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void fetchProducts();

    return () => controller.abort();
  }, [page, search, selectedCategoryId, maxPrice, minRating]);

  const sortedProducts = useMemo(() => {
    return [...products].sort((left, right) => {
      const difference = (left.averageRating ?? 0) - (right.averageRating ?? 0);
      return sort === "rating-asc" ? difference : -difference;
    });
  }, [products, sort]);

  const selectedCategory = categories.find((category) => category.id === selectedCategoryId);

  function resetPage(action: () => void) {
    setPage(1);
    action();
  }

  return (
    <>
      <ProductSearchBar
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        search={search}
        onCategoryChange={(categoryId) => resetPage(() => setSelectedCategoryId(categoryId))}
        onSearchChange={(value) => resetPage(() => setSearch(value))}
      />

      <main className="mx-auto max-w-282.5 px-4 py-8 min-[921px]:px-7">
        <div className="mb-5 flex flex-col gap-4 min-[760px]:flex-row min-[760px]:items-end min-[760px]:justify-between">
          <div>
            <ProductBreadcrumb current="All Products" />
            <h1 className="text-3xl font-extrabold text-text-dark">All Products</h1>
            <p className="mt-1 text-sm text-[#8792a1]">
              {total} items found{selectedCategory ? ` for "${selectedCategory.name}"` : ""}
            </p>
          </div>
          <ProductSortSelect value={sort} onChange={setSort} />
        </div>

        {error ? (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid gap-5 min-[921px]:grid-cols-[250px_1fr]">
          <ProductFilters
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            maxPrice={maxPrice}
            minRating={minRating}
            onCategoryChange={(categoryId) => resetPage(() => setSelectedCategoryId(categoryId))}
            onMaxPriceChange={(price) => resetPage(() => setMaxPrice(price))}
            onRatingChange={(rating) => resetPage(() => setMinRating(rating))}
            onClear={() =>
              resetPage(() => {
                setSelectedCategoryId("");
                setMaxPrice(5000);
                setMinRating(0);
                setSearch("");
              })
            }
          />
          <div>
            <ProductGrid products={sortedProducts} isLoading={isLoading} />
            <ProductPagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </div>
      </main>
    </>
  );
}
