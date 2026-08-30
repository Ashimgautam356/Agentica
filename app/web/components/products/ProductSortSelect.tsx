"use client";

import type { ProductSort } from "./types";

type ProductSortSelectProps = {
  value: ProductSort;
  onChange: (value: ProductSort) => void;
};

export function ProductSortSelect({ value, onChange }: ProductSortSelectProps) {
  return (
    <label className="inline-flex items-center gap-2 text-sm text-[#687487]">
      Sort by:
      <select
        className="h-10 rounded-md border border-[#dfe6e3] bg-white px-3 text-sm font-semibold text-text-dark outline-0"
        value={value}
        onChange={(event) => onChange(event.target.value as ProductSort)}
      >
        <option value="rating-desc">Highest rating</option>
        <option value="rating-asc">Lowest rating</option>
      </select>
    </label>
  );
}
