"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

type ProductPaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function ProductPagination({ page, totalPages, onPageChange }: ProductPaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className="mt-6 flex justify-center gap-2" aria-label="Product pagination">
      <button
        className="grid h-9 w-9 place-items-center rounded-full border border-[#dfe6e3] text-text-dark disabled:opacity-40"
        type="button"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {pages.map((pageNumber) => (
        <button
          className={`grid h-9 w-9 place-items-center rounded-full text-sm font-bold ${
            pageNumber === page
              ? "bg-main-green text-white"
              : "border border-[#dfe6e3] bg-white text-text-dark"
          }`}
          type="button"
          key={pageNumber}
          onClick={() => onPageChange(pageNumber)}
          aria-current={pageNumber === page ? "page" : undefined}
        >
          {pageNumber}
        </button>
      ))}
      <button
        className="grid h-9 w-9 place-items-center rounded-full border border-[#dfe6e3] text-text-dark disabled:opacity-40"
        type="button"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
