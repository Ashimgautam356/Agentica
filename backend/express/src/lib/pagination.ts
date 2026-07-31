import type { Request } from "express";

export type Pagination = {
  page: number;
  pageSize: number;
};

export type PaginatedResult<T> = Pagination & {
  items: T[];
  total: number;
  totalPages: number;
};

const pageSize = 10;

export function getPagination(query: Request["query"]): Pagination {
  const page = Number(query.page);

  return {
    page: Number.isInteger(page) && page > 0 ? page : 1,
    pageSize,
  };
}

export function paginatedResult<T>(
  items: T[],
  total: number,
  { page, pageSize }: Pagination,
): PaginatedResult<T> {
  return {
    items,
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}
