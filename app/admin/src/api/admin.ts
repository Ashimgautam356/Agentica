import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type AdminData = {
  generatedAt: string;
  stats: Stat[];
  revenue: number[];
  activities: Activity[];
  products: Product[];
  categories: Category[];
  inventory: InventoryItem[];
  orders: Order[];
  reviews: Review[];
  customers: Customer[];
  admins: AdminUser[];
  aiMetrics: Metric[];
  mcpTools: McpTool[];
  analytics: AnalyticsItem[];
  auditLogs: AuditLog[];
  settings: Setting[];
};

export type Stat = { label: string; value: string; note: string };
export type Activity = { event: string; owner: string; time: string };
export type Product = {
  name: string;
  sku: string;
  category: string;
  price: string;
  stock: number;
  status: string;
};
export type Category = { name: string; products: number; parent: string; status: string };
export type InventoryItem = {
  product: string;
  current: number;
  reserved: number;
  warehouse: string;
  updated: string;
};
export type Order = {
  id: string;
  customer: string;
  total: string;
  payment: string;
  status: string;
};
export type Review = { product: string; rating: string; customer: string; status: string };
export type Customer = { name: string; email: string; orders: number; status: string };
export type AdminUser = { name: string; email: string; role: string; status: string };
export type Metric = { label: string; value: string };
export type McpTool = { name: string; status: string; permissions: string; lastUsed: string };
export type AnalyticsItem = { label: string; value: string; detail: string };
export type AuditLog = { action: string; admin: string; module: string; severity: string };
export type Setting = { section: string; value: string };

export type CategoryRecord = {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ProductRecord = {
  id: string;
  skuId: string;
  name: string;
  imageId: string;
  description: string[];
  price: string | number;
  tags: string[];
  categoryId: string;
  category?: CategoryRecord;
};

export type CategoryInput = {
  name: string;
};

export type ProductInput = {
  name: string;
  imageId: string;
  description: string[];
  price: number;
  tags: string[];
  categoryId: string;
};

const emptyAdminData: AdminData = {
  generatedAt: new Date().toISOString(),
  stats: [],
  revenue: [],
  activities: [],
  products: [],
  categories: [],
  inventory: [],
  orders: [],
  reviews: [],
  customers: [],
  admins: [],
  aiMetrics: [],
  mcpTools: [],
  analytics: [],
  auditLogs: [],
  settings: [],
};

async function api<Data>(path: string, init?: RequestInit) {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (response.status === 204) {
    return undefined as Data;
  }

  const body = (await response.json()) as {
    data?: Data;
    error?: {
      message?: string;
      details?: unknown;
    };
    message?: string;
  };

  if (!response.ok) {
    throw new Error(formatApiError(body) ?? "Request failed");
  }

  return body.data as Data;
}

export function useAdminData() {
  return {
    data: emptyAdminData,
    error: null,
    isLoading: false,
  };
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => api<CategoryRecord[]>("/api/admin/categories"),
  });
}

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: () => api<ProductRecord[]>("/api/admin/products"),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CategoryInput) =>
      api<CategoryRecord>("/api/admin/categories", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CategoryInput }) =>
      api<CategoryRecord>(`/api/admin/categories/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api<void>(`/api/admin/categories/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ProductInput) =>
      api<ProductRecord>("/api/admin/products", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<ProductInput> }) =>
      api<ProductRecord>(`/api/admin/products/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api<void>(`/api/admin/products/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
}

function formatApiError(body: {
  error?: {
    message?: string;
    details?: unknown;
  };
  message?: string;
}) {
  const issues = Array.isArray(body.error?.details)
    ? body.error.details
        .flatMap((detail) =>
          isIssueGroup(detail) ? detail.issues.map((issue) => issue.message).filter(Boolean) : [],
        )
        .join(" ")
    : "";

  return [body.error?.message, issues, body.message].filter(Boolean).join(" ");
}

function isIssueGroup(value: unknown): value is { issues: Array<{ message: string }> } {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    Array.isArray((value as { issues?: unknown }).issues)
  );
}
