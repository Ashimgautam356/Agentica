import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../client";
import { adminQueryKeys } from "./queryKeys";
import { productsQueryOptions } from "./queryOptions";
import type { ProductInput, ProductRecord } from "./types";

export function useProducts(page = 1) {
  return useQuery(productsQueryOptions(page));
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ProductInput) =>
      api<ProductRecord>("/api/admin/products", {
        method: "POST",
        data: input,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminQueryKeys.products }),
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<ProductInput> }) =>
      api<ProductRecord>(`/api/admin/products/${id}`, {
        method: "PATCH",
        data: input,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminQueryKeys.products }),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api<void>(`/api/admin/products/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminQueryKeys.products }),
  });
}
