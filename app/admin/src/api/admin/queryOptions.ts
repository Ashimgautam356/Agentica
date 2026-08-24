import { queryOptions } from "@tanstack/react-query";
import { api } from "../client";
import { adminQueryKeys } from "./queryKeys";
import type {
  CategoryRecord,
  CurrentAdmin,
  PaginatedResponse,
  ProductRecord,
  ReviewRecord,
  UserRecord,
} from "./types";

export const currentAdminQueryOptions = () =>
  queryOptions({
    queryKey: adminQueryKeys.currentAdmin,
    queryFn: () => api<CurrentAdmin>("/api/admin/me"),
    staleTime: 30_000,
  });

export const categoriesQueryOptions = (page = 1) =>
  queryOptions({
    queryKey: adminQueryKeys.categoriesPage(page),
    queryFn: () => api<PaginatedResponse<CategoryRecord>>(`/api/admin/categories?page=${page}`),
    staleTime: 30_000,
  });

export const productsQueryOptions = (page = 1) =>
  queryOptions({
    queryKey: adminQueryKeys.productsPage(page),
    queryFn: () => api<PaginatedResponse<ProductRecord>>(`/api/admin/products?page=${page}`),
    staleTime: 30_000,
  });

export const reviewsQueryOptions = (page = 1) =>
  queryOptions({
    queryKey: adminQueryKeys.reviewsPage(page),
    queryFn: () => api<PaginatedResponse<ReviewRecord>>(`/api/admin/reviews?page=${page}`),
    staleTime: 30_000,
  });

export const customersQueryOptions = (page = 1, pageSize = 10) =>
  queryOptions({
    queryKey: adminQueryKeys.customersPage(page, pageSize),
    queryFn: () =>
      api<PaginatedResponse<UserRecord>>(`/api/admin/customers?page=${page}&pageSize=${pageSize}`),
    staleTime: 30_000,
  });

export const adminsQueryOptions = (page = 1) =>
  queryOptions({
    queryKey: adminQueryKeys.adminsPage(page),
    queryFn: () => api<PaginatedResponse<UserRecord>>(`/api/super-admin/admins?page=${page}`),
    staleTime: 30_000,
  });
