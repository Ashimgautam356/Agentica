/* eslint-disable react-refresh/only-export-components */
import { FormEvent, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  useCategories,
  useCreateCategory,
  useCreateProduct,
  useDeleteCategory,
  useDeleteProduct,
  useProducts,
  useUpdateCategory,
  useUpdateProduct,
  type AdminData,
  type CategoryInput,
  type CategoryRecord,
  type ProductInput,
  type ProductRecord,
} from "../api/admin";
import { Badge } from "../components/Badge";
import { DataTable } from "../components/DataTable";
import { PageHeader } from "../components/PageHeader";
import { Panel } from "../components/Panel";
import { RevenueChart } from "../components/RevenueChart";
import { StatGrid } from "../components/StatGrid";

export type PageKey =
  | "dashboard"
  | "products"
  | "categories"
  | "inventory"
  | "orders"
  | "reviews"
  | "customers"
  | "admins"
  | "ai"
  | "mcp"
  | "analytics"
  | "audit"
  | "settings";

export const pageTitles: Record<PageKey, string> = {
  dashboard: "Dashboard",
  products: "Products",
  categories: "Categories",
  inventory: "Inventory",
  orders: "Orders",
  reviews: "Reviews",
  customers: "Customers",
  admins: "Administrators",
  ai: "AI Management",
  mcp: "MCP Management",
  analytics: "Analytics",
  audit: "Audit Logs",
  settings: "Settings",
};

export const pageRoutes: Record<PageKey, string> = {
  dashboard: "/",
  products: "/product",
  categories: "/categorires",
  inventory: "/inventory",
  orders: "/orders",
  reviews: "/reviews",
  customers: "/customers",
  admins: "/administrators",
  ai: "/ai",
  mcp: "/mcp",
  analytics: "/analytics",
  audit: "/audit-logs",
  settings: "/settings",
};

export function renderPage(page: PageKey, data: AdminData) {
  const syncedAt = new Date(data.generatedAt).toLocaleTimeString();

  switch (page) {
    case "products":
      return <ProductsPage data={data} syncedAt={syncedAt} />;
    case "categories":
      return <CategoriesPage data={data} syncedAt={syncedAt} />;
    case "inventory":
      return <InventoryPage data={data} syncedAt={syncedAt} />;
    case "orders":
      return <OrdersPage data={data} syncedAt={syncedAt} />;
    case "reviews":
      return <ReviewsPage data={data} syncedAt={syncedAt} />;
    case "customers":
      return <CustomersPage data={data} syncedAt={syncedAt} />;
    case "admins":
      return <AdminsPage data={data} syncedAt={syncedAt} />;
    case "ai":
      return <AiPage data={data} syncedAt={syncedAt} />;
    case "mcp":
      return <McpPage data={data} syncedAt={syncedAt} />;
    case "analytics":
      return <AnalyticsPage data={data} syncedAt={syncedAt} />;
    case "audit":
      return <AuditPage data={data} syncedAt={syncedAt} />;
    case "settings":
      return <SettingsPage data={data} syncedAt={syncedAt} />;
    default:
      return <DashboardPage data={data} syncedAt={syncedAt} />;
  }
}

function DashboardPage({ data, syncedAt }: PageProps) {
  return (
    <>
      <PageHeader
        eyebrow="Super Admin"
        title="Operations console"
        description="Monitor commerce, catalog, AI, MCP tools, and system health from one admin workspace."
        syncedAt={syncedAt}
      />
      <StatGrid stats={data.stats} />
      <section className="grid grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)] gap-4 max-lg:grid-cols-2 max-sm:grid-cols-1">
        <Panel title="Revenue overview" eyebrow="Analytics" wide>
          <RevenueChart values={data.revenue} />
        </Panel>
        <Panel title="Recent activity" eyebrow="Activity">
          <ul className="grid gap-3.5">
            {data.activities.map((activity) => (
              <li
                className="border-l-4 border-blue-600 pl-3 leading-6 text-slate-700"
                key={activity.event}
              >
                <strong className="block">{activity.event}</strong>
                <span className="mt-1 block text-xs text-slate-500">
                  {activity.owner} · {activity.time}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="AI & MCP health" eyebrow="Platform">
          <MetricRows rows={data.aiMetrics} />
        </Panel>
      </section>
    </>
  );
}

function ProductsPage({ syncedAt }: PageProps) {
  const products = useProducts();
  const categories = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const [editing, setEditing] = useState<ProductRecord | null>(null);
  const rows = (products.data ?? []).map((product) => ({
    id: product.id,
    name: product.name,
    sku: product.skuId,
    category: product.category?.name ?? product.categoryId,
    price: String(product.price),
    image: product.imageId,
    actions: "",
  }));
  const error =
    products.error ??
    categories.error ??
    createProduct.error ??
    updateProduct.error ??
    deleteProduct.error;

  return (
    <>
      <PageHeader
        eyebrow="Catalog"
        title="Products"
        description="Create, edit, and delete products from the Express backend."
        syncedAt={syncedAt}
      />
      {error ? <InlineError error={error} /> : null}
      <Panel title={editing ? "Edit product" : "Create product"} eyebrow="Manage">
        <ProductForm
          categories={categories.data ?? []}
          initialProduct={editing}
          isSaving={createProduct.isPending || updateProduct.isPending}
          onCancel={() => setEditing(null)}
          onSubmit={(input) => {
            if (editing) {
              updateProduct.mutate(
                { id: editing.id, input },
                { onSuccess: () => setEditing(null) },
              );
              return;
            }

            createProduct.mutate(input);
          }}
        />
      </Panel>
      <Panel title="Product table" eyebrow="Manage">
        {products.isLoading ? <p className="text-slate-500">Loading products...</p> : null}
        <DataTable
          rows={rows}
          columns={[
            { key: "name", label: "Product Name" },
            { key: "sku", label: "SKU" },
            { key: "category", label: "Category" },
            { key: "price", label: "Price" },
            { key: "image", label: "Cloudinary Image ID" },
            {
              key: "actions",
              label: "Actions",
              render: (row) => (
                <RowActions
                  disabled={deleteProduct.isPending}
                  onDelete={() => deleteProduct.mutate(row.id as string)}
                  onEdit={() => {
                    const product = products.data?.find((item) => item.id === row.id);
                    if (product) {
                      setEditing(product);
                    }
                  }}
                />
              ),
            },
          ]}
        />
      </Panel>
    </>
  );
}

function CategoriesPage({ syncedAt }: PageProps) {
  const categories = useCategories();
  const products = useProducts();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const [editing, setEditing] = useState<CategoryRecord | null>(null);
  const productCounts = new Map<string, number>();

  for (const product of products.data ?? []) {
    productCounts.set(product.categoryId, (productCounts.get(product.categoryId) ?? 0) + 1);
  }

  const rows = (categories.data ?? []).map((category) => ({
    id: category.id,
    name: category.name,
    products: productCounts.get(category.id) ?? 0,
    status: "Active",
    actions: "",
  }));
  const error =
    categories.error ??
    products.error ??
    createCategory.error ??
    updateCategory.error ??
    deleteCategory.error;

  return (
    <>
      <PageHeader
        eyebrow="Catalog"
        title="Categories"
        description="Create, edit, and delete product categories from the Express backend."
        syncedAt={syncedAt}
      />
      {error ? <InlineError error={error} /> : null}
      <Panel title={editing ? "Edit category" : "Create category"} eyebrow="Catalog">
        <CategoryForm
          initialCategory={editing}
          isSaving={createCategory.isPending || updateCategory.isPending}
          onCancel={() => setEditing(null)}
          onSubmit={(input) => {
            if (editing) {
              updateCategory.mutate(
                { id: editing.id, input },
                { onSuccess: () => setEditing(null) },
              );
              return;
            }

            createCategory.mutate(input);
          }}
        />
      </Panel>
      <Panel title="Category structure" eyebrow="Catalog">
        {categories.isLoading ? <p className="text-slate-500">Loading categories...</p> : null}
        <DataTable
          rows={rows}
          columns={[
            { key: "name", label: "Category" },
            { key: "products", label: "Products" },
            { key: "status", label: "Status", render: (row) => <Badge value={row.status} /> },
            {
              key: "actions",
              label: "Actions",
              render: (row) => (
                <RowActions
                  disabled={deleteCategory.isPending}
                  onDelete={() => deleteCategory.mutate(row.id as string)}
                  onEdit={() => {
                    const category = categories.data?.find((item) => item.id === row.id);
                    if (category) {
                      setEditing(category);
                    }
                  }}
                />
              ),
            },
          ]}
        />
      </Panel>
    </>
  );
}

function InventoryPage({ data, syncedAt }: PageProps) {
  return (
    <>
      <PageHeader
        eyebrow="Catalog"
        title="Inventory"
        description="Track current, reserved, and available stock across warehouses."
        syncedAt={syncedAt}
      />
      <ToolRow actions={["Increase Stock", "Decrease Stock", "Stock History"]} />
      <Panel title="Warehouse inventory" eyebrow="Stock">
        <DataTable
          rows={data.inventory.map((item) => ({
            ...item,
            available: item.current - item.reserved,
          }))}
          columns={[
            { key: "product", label: "Product" },
            { key: "current", label: "Current" },
            { key: "reserved", label: "Reserved" },
            { key: "available", label: "Available" },
            { key: "warehouse", label: "Warehouse" },
            { key: "updated", label: "Last Updated" },
          ]}
        />
      </Panel>
    </>
  );
}

function OrdersPage({ data, syncedAt }: PageProps) {
  return (
    <>
      <PageHeader
        eyebrow="Sales"
        title="Orders"
        description="Review payment state, fulfillment status, refunds, and cancellation workflows."
        syncedAt={syncedAt}
      />
      <ToolRow actions={["View", "Update Status", "Refund", "Cancel Order"]} />
      <Panel title="Order queue" eyebrow="Sales">
        <DataTable
          rows={data.orders}
          columns={[
            { key: "id", label: "Order ID" },
            { key: "customer", label: "Customer" },
            { key: "total", label: "Total" },
            { key: "payment", label: "Payment", render: (row) => <Badge value={row.payment} /> },
            { key: "status", label: "Order Status", render: (row) => <Badge value={row.status} /> },
          ]}
        />
      </Panel>
      <StatusStrip
        values={["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"]}
      />
    </>
  );
}

function ReviewsPage({ data, syncedAt }: PageProps) {
  return (
    <>
      <PageHeader
        eyebrow="Sales"
        title="Reviews"
        description="Moderate customer feedback and reported product reviews."
        syncedAt={syncedAt}
      />
      <ToolRow actions={["Approve Review", "Reject Review", "Delete Review", "Reported Reviews"]} />
      <Panel title="Review moderation" eyebrow="Queue">
        <DataTable
          rows={data.reviews}
          columns={[
            { key: "product", label: "Product" },
            { key: "customer", label: "Customer" },
            { key: "rating", label: "Rating" },
            { key: "status", label: "Status", render: (row) => <Badge value={row.status} /> },
          ]}
        />
      </Panel>
    </>
  );
}

function CustomersPage({ data, syncedAt }: PageProps) {
  return (
    <>
      <PageHeader
        eyebrow="User Management"
        title="Customers"
        description="Inspect profiles, order counts, account status, and support actions."
        syncedAt={syncedAt}
      />
      <ToolRow actions={["View Profile", "Suspend Account", "Reset Password", "Delete Account"]} />
      <Panel title="Customer accounts" eyebrow="Accounts">
        <DataTable
          rows={data.customers}
          columns={[
            { key: "name", label: "Full Name" },
            { key: "email", label: "Email" },
            { key: "orders", label: "Orders" },
            { key: "status", label: "Status", render: (row) => <Badge value={row.status} /> },
          ]}
        />
      </Panel>
    </>
  );
}

function AdminsPage({ data, syncedAt }: PageProps) {
  return (
    <>
      <PageHeader
        eyebrow="Super Admin"
        title="Administrators"
        description="Manage administrator roles, permissions, account state, and access recovery."
        syncedAt={syncedAt}
      />
      <ToolRow
        actions={["Create Administrator", "Assign Permissions", "Suspend", "Reset Password"]}
      />
      <Panel title="Administrator accounts" eyebrow="Restricted">
        <DataTable
          rows={data.admins}
          columns={[
            { key: "name", label: "Name" },
            { key: "email", label: "Email" },
            { key: "role", label: "Role" },
            { key: "status", label: "Status", render: (row) => <Badge value={row.status} /> },
          ]}
        />
      </Panel>
    </>
  );
}

function AiPage({ data, syncedAt }: PageProps) {
  return (
    <>
      <PageHeader
        eyebrow="AI Management"
        title="AI services"
        description="Monitor requests, model usage, response time, token usage, and configuration."
        syncedAt={syncedAt}
      />
      <section className="grid grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)] gap-4 max-lg:grid-cols-2 max-sm:grid-cols-1">
        <Panel title="AI metrics" eyebrow="Runtime">
          <MetricRows rows={data.aiMetrics} />
        </Panel>
        <Panel title="Configuration" eyebrow="LLM">
          <FieldGrid
            fields={[
              "LLM Provider",
              "Temperature",
              "Max Tokens",
              "Prompt Templates",
              "Rate Limits",
            ]}
          />
        </Panel>
      </section>
    </>
  );
}

function McpPage({ data, syncedAt }: PageProps) {
  return (
    <>
      <PageHeader
        eyebrow="MCP Management"
        title="MCP tools"
        description="Control tool permissions, tool status, usage logs, and agent-facing capabilities."
        syncedAt={syncedAt}
      />
      <ToolRow actions={["Enable Tool", "Disable Tool", "Edit Tool", "View Logs"]} />
      <Panel title="Tool registry" eyebrow="MCP">
        <DataTable
          rows={data.mcpTools}
          columns={[
            { key: "name", label: "Tool Name" },
            { key: "permissions", label: "Permissions" },
            { key: "lastUsed", label: "Last Used" },
            { key: "status", label: "Status", render: (row) => <Badge value={row.status} /> },
          ]}
        />
      </Panel>
    </>
  );
}

function AnalyticsPage({ data, syncedAt }: PageProps) {
  return (
    <>
      <PageHeader
        eyebrow="Monitoring"
        title="Analytics"
        description="Track business performance, product movement, AI costs, and customer growth."
        syncedAt={syncedAt}
      />
      <section className="mb-4 grid grid-cols-4 gap-4 max-lg:grid-cols-2 max-sm:grid-cols-1">
        {data.analytics.map((item) => (
          <article
            className="grid min-h-32 gap-2.5 rounded-lg border border-slate-200 bg-white p-4"
            key={item.label}
          >
            <span className="text-sm font-bold text-slate-500">{item.label}</span>
            <strong className="text-3xl font-bold">{item.value}</strong>
            <small className="text-xs text-slate-500">{item.detail}</small>
          </article>
        ))}
      </section>
      <Panel title="Sales trend" eyebrow="Business" wide>
        <RevenueChart values={data.revenue} />
      </Panel>
    </>
  );
}

function AuditPage({ data, syncedAt }: PageProps) {
  return (
    <>
      <PageHeader
        eyebrow="Monitoring"
        title="Audit logs"
        description="Record administrator actions across auth, catalog, orders, AI, MCP, and settings."
        syncedAt={syncedAt}
      />
      <ToolRow actions={["Date Filter", "Administrator", "Module", "Severity"]} />
      <Panel title="Audit events" eyebrow="Logs">
        <DataTable
          rows={data.auditLogs}
          columns={[
            { key: "action", label: "Action" },
            { key: "admin", label: "Administrator" },
            { key: "module", label: "Module" },
            { key: "severity", label: "Severity", render: (row) => <Badge value={row.severity} /> },
          ]}
        />
      </Panel>
    </>
  );
}

function SettingsPage({ data, syncedAt }: PageProps) {
  return (
    <>
      <PageHeader
        eyebrow="System"
        title="Settings"
        description="Configure platform identity, auth, AI, MCP, integrations, security, and maintenance."
        syncedAt={syncedAt}
      />
      <section className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
        {data.settings.map((setting) => (
          <Panel key={setting.section} title={setting.section} eyebrow="Settings">
            <p className="m-0 leading-6 text-slate-700">{setting.value}</p>
          </Panel>
        ))}
      </section>
    </>
  );
}

type PageProps = {
  data: AdminData;
  syncedAt: string;
};

function CategoryForm({
  initialCategory,
  isSaving,
  onCancel,
  onSubmit,
}: {
  initialCategory: CategoryRecord | null;
  isSaving: boolean;
  onCancel: () => void;
  onSubmit: (input: CategoryInput) => void;
}) {
  const [name, setName] = useState(initialCategory?.name ?? "");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({ name: name.trim() });

    if (!initialCategory) {
      setName("");
    }
  }

  return (
    <form className="grid gap-3" onSubmit={submit}>
      <label className="grid gap-2">
        <span className="text-xs font-bold text-slate-500">Name</span>
        <input
          className="min-h-10 w-full rounded-lg border border-slate-200 px-3 text-slate-950"
          onChange={(event) => setName(event.target.value)}
          placeholder="Electronics"
          required
          value={name}
        />
      </label>
      <FormActions isEditing={Boolean(initialCategory)} isSaving={isSaving} onCancel={onCancel} />
    </form>
  );
}

function ProductForm({
  categories,
  initialProduct,
  isSaving,
  onCancel,
  onSubmit,
}: {
  categories: CategoryRecord[];
  initialProduct: ProductRecord | null;
  isSaving: boolean;
  onCancel: () => void;
  onSubmit: (input: ProductInput) => void;
}) {
  const [name, setName] = useState(initialProduct?.name ?? "");
  const [imageId, setImageId] = useState(initialProduct?.imageId ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [description, setDescription] = useState(initialProduct?.description.join("\n") ?? "");
  const [price, setPrice] = useState(String(initialProduct?.price ?? ""));
  const [tags, setTags] = useState(initialProduct?.tags.join(", ") ?? "");
  const [categoryId, setCategoryId] = useState(initialProduct?.categoryId ?? "");
  const { getInputProps, getRootProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
    onDrop: ([file]) => {
      if (!file) {
        return;
      }

      setImageFile(file);
      setImageId("");
      setUploadError("");
    },
    onDropRejected: () => setUploadError("Choose one image under 5 MB."),
  });

  const previewUrl = useMemo(() => (imageFile ? URL.createObjectURL(imageFile) : ""), [imageFile]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      if (!imageFile && !imageId.trim()) {
        setUploadError("Choose a product image first.");
        return;
      }

      setIsUploading(Boolean(imageFile));
      setUploadError("");
      const uploadedImageId = imageFile ? await uploadToCloudinary(imageFile) : imageId.trim();

      onSubmit({
        name: name.trim(),
        imageId: uploadedImageId,
        description: toList(description, "\n"),
        price: Number(price),
        tags: toList(tags, ","),
        categoryId,
      });
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Image upload failed.");
      return;
    } finally {
      setIsUploading(false);
    }

    if (!initialProduct) {
      setName("");
      setImageId("");
      setImageFile(null);
      setDescription("");
      setPrice("");
      setTags("");
      setCategoryId("");
    }
  }

  return (
    <form className="grid gap-3" onSubmit={submit}>
      <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
        <TextField label="Name" onChange={setName} required value={name} />
        <TextField
          label="Price"
          onChange={setPrice}
          required
          step="0.01"
          type="number"
          value={price}
        />
        <label className="grid gap-2">
          <span className="text-xs font-bold text-slate-500">Category</span>
          <select
            className="min-h-10 w-full rounded-lg border border-slate-200 px-3 text-slate-950"
            onChange={(event) => setCategoryId(event.target.value)}
            required
            value={categoryId}
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid gap-2">
        <span className="text-xs font-bold text-slate-500">Product image</span>
        <div
          {...getRootProps()}
          className={`grid min-h-36 cursor-pointer place-items-center rounded-lg border border-dashed px-4 py-5 text-center ${
            isDragActive ? "border-blue-400 bg-blue-50" : "border-slate-300 bg-slate-50"
          }`}
        >
          <input {...getInputProps()} />
          {previewUrl ? (
            <img
              alt="Selected product"
              className="max-h-48 rounded-lg object-contain"
              src={previewUrl}
            />
          ) : (
            <p className="m-0 text-sm font-semibold text-slate-600">
              Drop an image here, or click to choose one.
            </p>
          )}
        </div>
        {imageId && !imageFile ? (
          <p className="m-0 text-sm text-slate-500">Current Cloudinary ID: {imageId}</p>
        ) : null}
        {uploadError ? (
          <p className="m-0 text-sm font-semibold text-red-600">{uploadError}</p>
        ) : null}
      </div>
      <label className="grid gap-2">
        <span className="text-xs font-bold text-slate-500">Description</span>
        <textarea
          className="min-h-24 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-950"
          onChange={(event) => setDescription(event.target.value)}
          placeholder="One line per description item"
          value={description}
        />
      </label>
      <TextField label="Tags" onChange={setTags} placeholder="sale, featured" value={tags} />
      <FormActions
        isEditing={Boolean(initialProduct)}
        isSaving={isSaving || isUploading}
        onCancel={onCancel}
      />
    </form>
  );
}

function TextField({
  label,
  onChange,
  value,
  placeholder,
  required,
  step,
  type = "text",
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
  placeholder?: string;
  required?: boolean;
  step?: string;
  type?: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-bold text-slate-500">{label}</span>
      <input
        className="min-h-10 w-full rounded-lg border border-slate-200 px-3 text-slate-950"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder ?? label}
        required={required}
        step={step}
        type={type}
        value={value}
      />
    </label>
  );
}

function FormActions({
  isEditing,
  isSaving,
  onCancel,
}: {
  isEditing: boolean;
  isSaving: boolean;
  onCancel: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        className="min-h-10 rounded-lg bg-blue-600 px-4 font-bold text-white disabled:bg-slate-400"
        disabled={isSaving}
        type="submit"
      >
        {isSaving ? "Saving..." : isEditing ? "Save changes" : "Create"}
      </button>
      {isEditing ? (
        <button
          className="min-h-10 rounded-lg border border-slate-200 bg-white px-4 font-bold text-slate-700"
          onClick={onCancel}
          type="button"
        >
          Cancel
        </button>
      ) : null}
    </div>
  );
}

function RowActions({
  disabled,
  onDelete,
  onEdit,
}: {
  disabled?: boolean;
  onDelete: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        className="min-h-9 rounded-lg border border-slate-200 bg-white px-3 font-bold text-slate-700"
        onClick={onEdit}
        type="button"
      >
        Edit
      </button>
      <button
        className="min-h-9 rounded-lg border border-red-200 bg-red-50 px-3 font-bold text-red-700 disabled:opacity-60"
        disabled={disabled}
        onClick={onDelete}
        type="button"
      >
        Delete
      </button>
    </div>
  );
}

function InlineError({ error }: { error: Error }) {
  return (
    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-700">
      {error.message}
    </div>
  );
}

function toList(value: string, separator: "," | "\n") {
  return value
    .split(separator)
    .map((item) => item.trim())
    .filter(Boolean);
}

async function uploadToCloudinary(file: File) {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined;

  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary env values are missing in app/admin/.env.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });
  const body = (await response.json()) as { public_id?: string; error?: { message?: string } };

  if (!response.ok || !body.public_id) {
    throw new Error(body.error?.message ?? "Cloudinary upload failed.");
  }

  return body.public_id;
}

function ToolRow({ actions }: { actions: string[] }) {
  return (
    <div className="mb-4 flex flex-wrap gap-2.5" aria-label="Page actions">
      {actions.map((action) => (
        <button
          className="min-h-10 rounded-lg border border-slate-200 bg-white px-3.5 font-bold text-slate-700 first:border-blue-200 first:bg-blue-50 first:text-blue-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          key={action}
          type="button"
        >
          {action}
        </button>
      ))}
    </div>
  );
}

function FieldGrid({ fields }: { fields: string[] }) {
  return (
    <div className="grid grid-cols-3 gap-3.5 max-lg:grid-cols-2 max-sm:grid-cols-1">
      {fields.map((field) => (
        <label className="grid gap-2" key={field}>
          <span className="text-xs font-bold text-slate-500">{field}</span>
          <input
            className="min-h-10 w-full rounded-lg border border-slate-200 px-3 text-slate-950"
            placeholder={field}
          />
        </label>
      ))}
    </div>
  );
}

function MetricRows({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <div className="grid gap-3">
      {rows.map((row) => (
        <div
          className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3 last:border-b-0 last:pb-0"
          key={row.label}
        >
          <span className="text-slate-500">{row.label}</span>
          <strong>{row.value}</strong>
        </div>
      ))}
    </div>
  );
}

function StatusStrip({ values }: { values: string[] }) {
  return (
    <Panel title="Order status flow" eyebrow="Workflow">
      <div className="flex flex-wrap gap-2.5">
        {values.map((value) => (
          <Badge key={value} value={value} />
        ))}
      </div>
    </Panel>
  );
}
