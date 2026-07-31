import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../client";
import { adminQueryKeys } from "./queryKeys";
import { usersQueryOptions } from "./queryOptions";
import type { UserInput, UserPasswordInput, UserRecord } from "./types";

export function useUsers(page = 1) {
  return useQuery(usersQueryOptions(page));
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UserInput }) =>
      api<UserRecord>(`/api/admin/users/${id}`, {
        method: "PATCH",
        data: input,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminQueryKeys.users }),
  });
}

export function useUpdateUserPassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UserPasswordInput }) =>
      api<UserRecord>(`/api/admin/users/${id}/password`, {
        method: "PATCH",
        data: input,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminQueryKeys.users }),
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api<void>(`/api/admin/users/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminQueryKeys.users }),
  });
}

export function useDeleteUserSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, sessionId }: { userId: string; sessionId: string }) =>
      api<void>(`/api/admin/users/${userId}/sessions/${sessionId}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminQueryKeys.users }),
  });
}
