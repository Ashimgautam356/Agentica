import { queryOptions } from "@tanstack/react-query";
import { api } from "../client";
import { adminQueryKeys } from "./queryKeys";
import type { CategoryRecord, ProductRecord, ReviewRecord, UserRecord } from "./types";

export const categoriesQueryOptions = () =>
  queryOptions({
    queryKey: adminQueryKeys.categories,
    queryFn: () => api<CategoryRecord[]>("/api/admin/categories"),
  });

export const productsQueryOptions = () =>
  queryOptions({
    queryKey: adminQueryKeys.products,
    queryFn: () => api<ProductRecord[]>("/api/admin/products"),
  });

export const reviewsQueryOptions = () =>
  queryOptions({
    queryKey: adminQueryKeys.reviews,
    queryFn: () => api<ReviewRecord[]>("/api/admin/reviews"),
  });

export const usersQueryOptions = () =>
  queryOptions({
    queryKey: adminQueryKeys.users,
    queryFn: () => api<UserRecord[]>("/api/admin/users"),
  });
