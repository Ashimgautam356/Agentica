import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../client";
import { adminQueryKeys } from "./queryKeys";
import { adminsQueryOptions, customersQueryOptions } from "./queryOptions";
import type {
  AdminInput,
  AdminUpdateInput,
  UserInput,
  UserPasswordInput,
  UserRecord,
} from "./types";

export function useCustomers(page = 1, pageSize = 10) {
  return useQuery(customersQueryOptions(page, pageSize));
}

export function useAdmins(page = 1) {
  return useQuery(adminsQueryOptions(page));
}

export function useCreateAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AdminInput) =>
      api<UserRecord>("/api/super-admin/admins", {
        method: "POST",
        data: input,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminQueryKeys.admins }),
  });
}

export function useUpdateAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: AdminUpdateInput }) =>
      api<UserRecord>(`/api/super-admin/admins/${id}`, {
        method: "PATCH",
        data: input,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminQueryKeys.admins }),
  });
}

export function useDeleteAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api<void>(`/api/super-admin/admins/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminQueryKeys.admins }),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UserInput }) =>
      api<UserRecord>(`/api/admin/customers/${id}`, {
        method: "PATCH",
        data: input,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminQueryKeys.customers }),
  });
}

export function useUpdateUserPassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UserPasswordInput }) =>
      api<UserRecord>(`/api/admin/customers/${id}/password`, {
        method: "PATCH",
        data: input,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminQueryKeys.customers }),
  });
}

export function useDisableUserApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      api<UserRecord>(`/api/admin/customers/${id}/api-key/disable`, { method: "PATCH" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminQueryKeys.customers }),
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api<void>(`/api/admin/customers/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminQueryKeys.customers }),
  });
}

export function useDeleteUserSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, sessionId }: { userId: string; sessionId: string }) =>
      api<void>(`/api/admin/customers/${userId}/sessions/${sessionId}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminQueryKeys.customers }),
  });
}
