import { ProductCard } from "./ProductCard";
import type { Product } from "./types";

type ProductGridProps = {
  products: Product[];
  isLoading: boolean;
};

export function ProductGrid({ products, isLoading }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 min-[620px]:grid-cols-2 min-[1080px]:grid-cols-3 min-[1280px]:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div className="h-65 rounded-md border border-[#dfe6e3] bg-white p-3" key={index}>
            <div className="h-35 rounded-md bg-[#eef4f1]" />
            <div className="mt-4 h-4 w-4/5 rounded bg-[#eef4f1]" />
            <div className="mt-3 h-4 w-1/2 rounded bg-[#eef4f1]" />
            <div className="mt-5 h-9 rounded bg-[#eef4f1]" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="grid min-h-72 place-items-center rounded-md border border-dashed border-[#cfd9d4] bg-white p-8 text-center">
        <p className="max-w-sm text-sm font-semibold text-[#687487]">
          No products match the current search and filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 min-[620px]:grid-cols-2 min-[1080px]:grid-cols-3 min-[1280px]:grid-cols-4">
      {products.map((product) => (
        <ProductCard product={product} key={product.id} />
      ))}
    </div>
  );
}
