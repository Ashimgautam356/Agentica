import { RiArrowLeftSLine, RiArrowRightSLine } from "@remixicon/react";

export function Pagination({
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#EFE7D8] pt-4">
      <p className="m-0 text-sm font-semibold text-[#8A8172]">
        Showing {start}-{end} of {total}
      </p>
      <div className="flex items-center gap-2">
        <button
          aria-label="Previous page"
          className="grid size-10 place-items-center rounded-lg border border-[#EFE7D8] bg-white text-[#6A717F] transition-[background-color,color,transform] duration-150 hover:bg-[#EAF5EC] hover:text-[#34A85B] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          type="button"
        >
          <RiArrowLeftSLine size={20} />
        </button>
        <span className="min-w-24 text-center text-sm font-medium text-[#241F14]">
          Page {page} / {totalPages}
        </span>
        <button
          aria-label="Next page"
          className="grid size-10 place-items-center rounded-lg border border-[#EFE7D8] bg-white text-[#6A717F] transition-[background-color,color,transform] duration-150 hover:bg-[#EAF5EC] hover:text-[#34A85B] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          type="button"
        >
          <RiArrowRightSLine size={20} />
        </button>
      </div>
    </div>
  );
}
