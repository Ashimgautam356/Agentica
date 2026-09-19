"use client";

import type { Category } from "@/stores/category-store";

type ProductFiltersProps = {
  categories: Category[];
  selectedCategoryId: string;
  maxPrice: number;
  minRating: number;
  onCategoryChange: (categoryId: string) => void;
  onMaxPriceChange: (price: number) => void;
  onRatingChange: (rating: number) => void;
  onClear: () => void;
};

const ratingOptions = [4, 3, 2];

export function ProductFilters({
  categories,
  selectedCategoryId,
  maxPrice,
  minRating,
  onCategoryChange,
  onMaxPriceChange,
  onRatingChange,
  onClear,
}: ProductFiltersProps) {
  return (
    <aside className="rounded-md border border-[#dfe6e3] bg-white p-5">
      <div className="flex items-center justify-between border-b border-[#edf1ef] pb-4">
        <h2 className="text-base font-extrabold text-[#111827]">Filters</h2>
        <button className="text-xs font-extrabold text-[#16a34a]" type="button" onClick={onClear}>
          Clear all
        </button>
      </div>

      <fieldset className="mt-5">
        <legend className="text-sm font-extrabold text-[#111827]">Category</legend>
        <div className="mt-3 space-y-2">
          {categories.map((category) => (
            <label
              className="flex cursor-pointer items-center gap-2 text-sm text-[#687487]"
              key={category.id}
            >
              <input
                className="h-4 w-4 accent-main-green"
                type="checkbox"
                checked={selectedCategoryId === category.id}
                onChange={() =>
                  onCategoryChange(selectedCategoryId === category.id ? "" : category.id)
                }
              />
              {category.name}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-6 border-t border-[#edf1ef] pt-5">
        <legend className="text-sm font-extrabold text-[#111827]">Price Range</legend>
        <input
          className="mt-4 w-full accent-main-green"
          type="range"
          min="0"
          max="5000"
          step="100"
          value={maxPrice}
          onChange={(event) => onMaxPriceChange(Number(event.target.value))}
        />
        <div className="mt-2 flex justify-between text-xs font-semibold text-[#98a4b3]">
          <span>Rs 0</span>
          <span>Rs {maxPrice.toLocaleString("en-US")}</span>
        </div>
      </fieldset>

      <fieldset className="mt-6 border-t border-[#edf1ef] pt-5">
        <legend className="text-sm font-extrabold text-[#111827]">Rating</legend>
        <div className="mt-3 space-y-2">
          {ratingOptions.map((rating) => (
            <label
              className="flex cursor-pointer items-center gap-2 text-sm text-[#687487]"
              key={rating}
            >
              <input
                className="h-4 w-4 accent-main-green"
                type="radio"
                name="rating"
                checked={minRating === rating}
                onChange={() => onRatingChange(rating)}
              />
              {rating} stars & up
            </label>
          ))}
        </div>
      </fieldset>
    </aside>
  );
}
