import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../client";
import { adminQueryKeys } from "./queryKeys";
import { ordersQueryOptions } from "./queryOptions";
import type { OrderRecord } from "./types";

export function useOrders(page = 1) {
  return useQuery(ordersQueryOptions(page));
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderRecord["status"] }) =>
      api<OrderRecord>(`/api/admin/orders/${id}/status`, {
        method: "PATCH",
        data: { status },
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminQueryKeys.orders }),
  });
}
