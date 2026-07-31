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
  imageId?: string | null;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    products: number;
  };
};

export type ProductRecord = {
  id: string;
  skuId: string;
  name: string;
  imageId: string;
  imageId1?: string | null;
  imageId2?: string | null;
  description: string[];
  price: string | number;
  tags: string[];
  categoryId: string;
  category?: CategoryRecord;
};

export type ReviewRecord = {
  id: string;
  rating: number;
  description: string;
  userId: string;
  productId: string;
  createdAt?: string;
  updatedAt?: string;
  user: {
    id: string;
    email?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    imageId?: string | null;
  };
  product: ProductRecord;
};

export type UserSessionRecord = {
  id: string;
  userAgent?: string | null;
  ipAddress?: string | null;
  expiresAt: string;
  revokedAt?: string | null;
  createdAt: string;
};

export type UserRecord = {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  imageId?: string | null;
  age?: number | null;
  contact?: string | null;
  address?: string | null;
  emailVerifiedAt?: string | null;
  lastLoginAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  sessions?: UserSessionRecord[];
};

export type CategoryInput = {
  name: string;
  imageId: string;
};

export type ProductInput = {
  name: string;
  imageId: string;
  imageId1?: string | null;
  imageId2?: string | null;
  description: string[];
  price: number;
  tags: string[];
  categoryId: string;
};

export type UserInput = {
  firstName?: string | null;
  lastName?: string | null;
  imageId?: string | null;
};

export type UserPasswordInput = {
  password: string;
};

export type PaginatedResponse<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};
