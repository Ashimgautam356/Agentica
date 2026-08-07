import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../client";
import { adminQueryKeys } from "./queryKeys";
import { reviewsQueryOptions } from "./queryOptions";

export function useReviews(page = 1) {
  return useQuery(reviewsQueryOptions(page));
}

export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api<void>(`/api/admin/reviews/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminQueryKeys.reviews }),
  });
}
