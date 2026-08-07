import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../client";
import { adminQueryKeys } from "./queryKeys";
import { categoriesQueryOptions } from "./queryOptions";
import type { CategoryInput, CategoryRecord } from "./types";

export function useCategories(page = 1) {
  return useQuery(categoriesQueryOptions(page));
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CategoryInput) =>
      api<CategoryRecord>("/api/admin/categories", {
        method: "POST",
        data: input,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminQueryKeys.categories }),
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CategoryInput }) =>
      api<CategoryRecord>(`/api/admin/categories/${id}`, {
        method: "PATCH",
        data: input,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminQueryKeys.categories }),
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api<void>(`/api/admin/categories/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.categories });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.products });
    },
  });
}
