import { queryOptions } from "@tanstack/react-query";
import { api } from "../client";
import { adminQueryKeys } from "./queryKeys";
import type {
  CategoryRecord,
  PaginatedResponse,
  ProductRecord,
  ReviewRecord,
  UserRecord,
} from "./types";

export const categoriesQueryOptions = (page = 1) =>
  queryOptions({
    queryKey: adminQueryKeys.categoriesPage(page),
    queryFn: () => api<PaginatedResponse<CategoryRecord>>(`/api/admin/categories?page=${page}`),
  });

export const productsQueryOptions = (page = 1) =>
  queryOptions({
    queryKey: adminQueryKeys.productsPage(page),
    queryFn: () => api<PaginatedResponse<ProductRecord>>(`/api/admin/products?page=${page}`),
  });

export const reviewsQueryOptions = (page = 1) =>
  queryOptions({
    queryKey: adminQueryKeys.reviewsPage(page),
    queryFn: () => api<PaginatedResponse<ReviewRecord>>(`/api/admin/reviews?page=${page}`),
  });

export const usersQueryOptions = (page = 1) =>
  queryOptions({
    queryKey: adminQueryKeys.usersPage(page),
    queryFn: () => api<PaginatedResponse<UserRecord>>(`/api/admin/users?page=${page}`),
  });
