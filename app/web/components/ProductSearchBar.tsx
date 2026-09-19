"use client";

import { FormEvent, useState } from "react";
import type { Category } from "@/stores/category-store";

type ProductSearchBarProps = {
  categories: Category[];
  selectedCategoryId?: string;
  search?: string;
  onCategoryChange?: (categoryId: string) => void;
  onSearchChange?: (search: string) => void;
};

export function ProductSearchBar({
  categories,
  selectedCategoryId = "",
  search = "",
  onCategoryChange,
  onSearchChange,
}: ProductSearchBarProps) {
  const [draftSearch, setDraftSearch] = useState(search);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearchChange?.(draftSearch.trim());
  }

  return (
    <div className="relative z-10 h-13.25 bg-[#eef8fb]">
      <div className="mx-auto flex h-full max-w-268 items-center gap-0.75 px-5.5">
        <label className="sr-only" htmlFor="site-category">
          Category
        </label>
        <select
          className="flex h-10.25 basis-40 appearance-none items-center justify-center rounded-l-full border-0 bg-white px-5 text-[13px] font-semibold text-placeholder outline-0"
          id="site-category"
          value={selectedCategoryId}
          onChange={(event) => onCategoryChange?.(event.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option value={category.id} key={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <form
          className="flex h-10.25 flex-1 items-center overflow-hidden rounded-r-full border-0 bg-white"
          onSubmit={handleSubmit}
        >
          <label className="sr-only" htmlFor="site-search">
            Search products
          </label>
          <input
            className="h-full w-full border-0 px-5 text-xs font-semibold text-text-dark outline-0 placeholder:text-placeholder"
            id="site-search"
            type="search"
            value={draftSearch}
            placeholder="What are you looking for ?"
            onChange={(event) => setDraftSearch(event.target.value)}
          />
          <button
            className="inline-flex h-10.25 w-12.5 cursor-pointer items-center justify-center rounded-r-full border-0 bg-main-green text-white"
            type="submit"
            aria-label="Search"
          >
            <svg
              className="h-4.25 w-4.25 fill-none stroke-current stroke-2 [stroke-linecap:round] [stroke-linejoin:round]"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="m21 21-4.3-4.3M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
