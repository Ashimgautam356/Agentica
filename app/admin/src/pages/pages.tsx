/* eslint-disable react-refresh/only-export-components */
import {
  RiAddLine,
  RiArrowDownSLine,
  RiArrowRightUpLine,
  RiBox3Line,
  RiCalendarLine,
  RiCloseLine,
  RiDeleteBin6Line,
  RiEdit2Line,
  RiNotification3Line,
  RiSearchLine,
  RiShoppingCart2Line,
  RiStarSmileLine,
  RiTeamLine,
  type RemixiconComponentType,
} from "@remixicon/react";
import { useMemo, useState, type FormEvent } from "react";
import {
  type AdminData,
  type UserRecord,
  useAdmins,
  useCreateAdmin,
  useDeleteAdmin,
  useUpdateAdmin,
} from "../api/admin";
import { Badge } from "../components/Badge";
import { ButtonSpinner } from "../components/ButtonSpinner";
import { DataTable } from "../components/DataTable";
import { LoadingState } from "../components/LoadingState";
import { PageHeader } from "../components/PageHeader";
import { Panel } from "../components/Panel";
import { RevenueChart } from "../components/RevenueChart";
import { useToast } from "../components/Toast";
import { getErrorMessage } from "../lib/utils";
import { CategoryPage } from "./CategoryPage";
import { CustomerPage } from "./CustomerPage";
import { ProductPage } from "./ProductPage";
import { ReviewPage } from "./ReviewPage";

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
  dashboard: "Overview",
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
  dashboard: "/dashboard",
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

export function renderPage(
  page: PageKey,
  data: AdminData,
  isLoading = false,
  error: unknown = null,
) {
  const syncedAt = new Date(data.generatedAt).toLocaleTimeString();

  switch (page) {
    case "products":
      return <ProductPage syncedAt={syncedAt} />;
    case "categories":
      return <CategoryPage syncedAt={syncedAt} />;
    case "inventory":
      return <InventoryPage data={data} error={error} isLoading={isLoading} syncedAt={syncedAt} />;
    case "orders":
      return <OrdersPage data={data} error={error} isLoading={isLoading} syncedAt={syncedAt} />;
    case "reviews":
      return <ReviewPage syncedAt={syncedAt} />;
    case "customers":
      return <CustomerPage syncedAt={syncedAt} />;
    case "admins":
      return <AdminsPage data={data} syncedAt={syncedAt} />;
    case "ai":
      return <AiPage data={data} error={error} isLoading={isLoading} syncedAt={syncedAt} />;
    case "mcp":
      return <McpPage data={data} error={error} isLoading={isLoading} syncedAt={syncedAt} />;
    case "analytics":
      return <AnalyticsPage data={data} error={error} isLoading={isLoading} syncedAt={syncedAt} />;
    case "audit":
      return <AuditPage data={data} error={error} isLoading={isLoading} syncedAt={syncedAt} />;
    case "settings":
      return <SettingsPage data={data} error={error} isLoading={isLoading} syncedAt={syncedAt} />;
    default:
      return <DashboardPage data={data} error={error} isLoading={isLoading} syncedAt={syncedAt} />;
  }
}

function DashboardPage({ data, error, isLoading, syncedAt }: PageProps) {
  const status = pageDataStatus(isLoading, error, "Loading dashboard data");

  if (status) {
    return status;
  }

  const statIcons = [RiBox3Line, RiShoppingCart2Line, RiStarSmileLine, RiTeamLine];
  const statStyles = [
    { accent: "#34A85B", tint: "#EAF5EC" },
    { accent: "#E8A33D", tint: "#FFF4E4" },
    { accent: "#34A85B", tint: "#EAF5EC" },
    { accent: "#7BAE8F", tint: "#EEF6F1" },
  ];
  const dashboardStats = data.stats.map((stat, index) => ({
    ...stat,
    icon: statIcons[index] ?? RiBox3Line,
    ...(statStyles[index] ?? statStyles[0]),
  }));
  const monthlySales = data.revenue.map((value, index) => ({
    month: `M${index + 1}`,
    value,
    tone: index === data.revenue.length - 1 ? "#E8A33D" : "#34A85B",
  }));
  const topCategories = data.categories.slice(0, 4);
  const recentProducts = data.products.slice(0, 4);
  const recentOrders = data.orders.slice(0, 4);

  return (
    <div className="grid gap-6">
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-[#EFE7D8] bg-white px-5 py-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#8A8172]">Welcome back, Admin</p>
          <h2 className="mt-1 text-2xl font-extrabold leading-tight text-[#241F14] max-sm:text-xl">
            Ecommerce performance at a glance
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex min-h-11 items-center gap-2 rounded-lg border border-[#EFE7D8] bg-[#FBF8F2] px-3 text-sm font-semibold text-[#6A717F]">
            <RiSearchLine size={18} />
            <input
              className="w-44 bg-transparent text-[#241F14] outline-none placeholder:text-[#8A8172] max-sm:w-32"
              placeholder="Search"
              type="search"
            />
          </label>
          <button
            className="grid size-11 place-items-center rounded-lg border border-[#EFE7D8] bg-white text-[#6A717F] transition-[background-color,color,transform] duration-150 hover:bg-[#EAF5EC] hover:text-[#34A85B] active:scale-95"
            aria-label="Notifications"
            type="button"
          >
            <RiNotification3Line size={20} />
          </button>
          <button
            className="flex min-h-11 items-center gap-2 rounded-lg bg-[#34A85B] px-4 text-sm font-bold text-white transition-[background-color,transform] duration-150 hover:bg-[#2C8F4E] active:scale-95"
            type="button"
          >
            <RiCalendarLine size={18} />
            This month
            <RiArrowDownSLine size={18} />
          </button>
        </div>
      </section>

      <section className="grid grid-cols-4 gap-4 max-xl:grid-cols-2 max-sm:grid-cols-1">
        {dashboardStats.map((stat) => (
          <DashboardStat key={stat.label} {...stat} />
        ))}
      </section>

      <section className="grid grid-cols-[minmax(0,1fr)_398px] gap-6 max-xl:grid-cols-1">
        <article className="rounded-lg border border-[#EFE7D8] bg-white p-5">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase text-[#34A85B]">Sales overview</p>
              <h2 className="mt-2 text-lg font-extrabold text-[#241F14]">Monthly revenue</h2>
            </div>
            <span className="rounded-full bg-[#EAF5EC] px-3 py-1 text-xs font-bold text-[#34A85B]">
              Synced {syncedAt}
            </span>
          </div>
          <div className="flex h-[280px] items-end gap-5 border-b border-[#EFE7D8] px-2 max-sm:h-56 max-sm:gap-3">
            {monthlySales.length > 0 ? (
              monthlySales.map((item) => (
                <div className="flex min-w-0 flex-1 flex-col items-center gap-3" key={item.month}>
                  <div
                    className="w-full max-w-[34px] rounded-t-lg"
                    style={{ height: `${item.value}%`, backgroundColor: item.tone }}
                  />
                  <span className="text-xs font-semibold text-[#8A8172]">{item.month}</span>
                </div>
              ))
            ) : (
              <p className="m-auto text-sm font-semibold text-[#8A8172]">No revenue data.</p>
            )}
          </div>
        </article>

        <article className="rounded-lg border border-[#EFE7D8] bg-white p-5">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase text-[#E8A33D]">Top categories</p>
              <h2 className="mt-2 text-lg font-extrabold text-[#241F14]">Best sellers</h2>
            </div>
            <RiStarSmileLine className="text-[#E8A33D]" size={24} />
          </div>
          <div className="grid gap-4">
            {topCategories.length > 0 ? (
              topCategories.map((item, index) => (
                <div className="grid gap-2" key={item.name}>
                  <div className="flex items-center justify-between gap-3 text-sm font-bold">
                    <span className="text-[#241F14]">{item.name}</span>
                    <span className="tabular-nums text-[#6A717F]">{item.products}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#F1EEE8]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: index === 1 ? "#E8A33D" : "#34A85B",
                        width: `${82 - index * 16}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="m-0 text-sm font-semibold text-[#8A8172]">No categories found.</p>
            )}
          </div>
        </article>
      </section>

      <section className="grid grid-cols-[minmax(0,1fr)_398px] gap-6 max-xl:grid-cols-1">
        <article className="rounded-lg border border-[#EFE7D8] bg-white p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-extrabold text-[#241F14]">Recent products</h2>
            <button
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#EFE7D8] px-3 text-sm font-bold text-[#6A717F] transition-[background-color,color,transform] duration-150 hover:bg-[#EAF5EC] hover:text-[#34A85B] active:scale-95"
              type="button"
            >
              View all
              <RiArrowRightUpLine size={18} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-separate border-spacing-y-2 text-left">
              <thead>
                <tr className="text-xs font-bold uppercase text-[#8A8172]">
                  <th className="px-3 py-2">Product</th>
                  <th className="px-3 py-2">Category</th>
                  <th className="px-3 py-2">Price</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentProducts.length > 0 ? (
                  recentProducts.map((product) => (
                    <tr
                      className="bg-[#FBF8F2] text-sm font-semibold text-[#241F14]"
                      key={product.name}
                    >
                      <td className="rounded-l-lg px-3 py-3">{product.name}</td>
                      <td className="px-3 py-3 text-[#6A717F]">{product.category}</td>
                      <td className="px-3 py-3 tabular-nums">{product.price}</td>
                      <td className="rounded-r-lg px-3 py-3">
                        <Badge value={product.status} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-3 py-3 text-sm font-semibold text-[#8A8172]" colSpan={4}>
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-lg border border-[#EFE7D8] bg-white p-5">
          <h2 className="text-lg font-extrabold text-[#241F14]">Recent orders</h2>
          <div className="mt-4 grid gap-3">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div className="rounded-lg bg-[#FBF8F2] p-4" key={order.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-extrabold text-[#241F14]">
                        {order.customer}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-[#8A8172]">{order.id}</p>
                    </div>
                    <span className="text-sm font-extrabold tabular-nums text-[#241F14]">
                      {order.total}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge value={order.payment} />
                    <Badge value={order.status} />
                  </div>
                </div>
              ))
            ) : (
              <p className="m-0 text-sm font-semibold text-[#8A8172]">No orders found.</p>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}

function DashboardStat({
  label,
  value,
  note,
  icon: Icon,
  accent,
  tint,
}: {
  label: string;
  value: string;
  note: string;
  icon: RemixiconComponentType;
  accent: string;
  tint: string;
}) {
  return (
    <article className="rounded-lg border border-[#EFE7D8] bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-bold text-[#8A8172]">{label}</p>
          <strong className="mt-3 block text-3xl font-extrabold leading-none tabular-nums text-[#241F14]">
            {value}
          </strong>
        </div>
        <span
          className="grid size-11 shrink-0 place-items-center rounded-lg"
          style={{ backgroundColor: tint, color: accent }}
        >
          <Icon size={22} />
        </span>
      </div>
      <p className="mt-4 text-xs font-semibold text-[#6A717F]">{note}</p>
    </article>
  );
}

function InventoryPage({ data, error, isLoading, syncedAt }: PageProps) {
  const status = pageDataStatus(isLoading, error, "Loading inventory data");

  if (status) {
    return status;
  }

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

function OrdersPage({ data, error, isLoading, syncedAt }: PageProps) {
  const status = pageDataStatus(isLoading, error, "Loading orders data");

  if (status) {
    return status;
  }

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

function AdminsPage({ syncedAt }: PageProps) {
  const admins = useAdmins();
  const createAdmin = useCreateAdmin();
  const updateAdmin = useUpdateAdmin();
  const deleteAdmin = useDeleteAdmin();
  const toast = useToast();
  const [formError, setFormError] = useState("");
  const [search, setSearch] = useState("");
  const [editingAdmin, setEditingAdmin] = useState<UserRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const adminList = admins.data?.items ?? [];
  const rows = useMemo(() => {
    const query = search.trim().toLowerCase();

    return adminList
      .filter((admin) => {
        if (!query) {
          return true;
        }

        return [
          [admin.firstName, admin.lastName].filter(Boolean).join(" ") || "Admin",
          admin.email ?? "",
          admin.emailVerifiedAt ? "Verified" : "Not Verified",
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);
      })
      .map((admin) => ({
        id: admin.id,
        name: [admin.firstName, admin.lastName].filter(Boolean).join(" ") || "Admin",
        email: admin.email ?? "-",
        role: "Admin",
        status: admin.emailVerifiedAt ? "Verified" : "Not Verified",
        actions: "",
      }));
  }, [adminList, search]);

  function closeAdminModal() {
    setIsModalOpen(false);
    setEditingAdmin(null);
    setFormError("");
  }

  function handleAdminSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    setFormError("");
    if (editingAdmin) {
      updateAdmin.mutate(
        { id: editingAdmin.id, input: { email, ...(password ? { password } : {}) } },
        {
          onSuccess: () => {
            formElement.reset();
            closeAdminModal();
            toast.success("Administrator updated successfully.");
          },
          onError: (error) => {
            const message = getErrorMessage(error, "Could not update admin.");

            setFormError(message);
            toast.error(message);
          },
        },
      );
      return;
    }

    createAdmin.mutate(
      { email, password },
      {
        onSuccess: () => {
          formElement.reset();
          closeAdminModal();
          toast.success("Administrator created successfully.");
        },
        onError: (error) => {
          const message = getErrorMessage(error, "Could not create admin.");

          setFormError(message);
          toast.error(message);
        },
      },
    );
  }

  return (
    <>
      <section className="grid gap-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase text-[#34A85B]">Super Admin</p>
            <h2 className="mt-1 text-2xl font-extrabold text-[#241F14]">Administrator list</h2>
            <p className="mt-2 text-sm font-semibold text-[#8A8172]">Last synced at {syncedAt}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 max-sm:w-full">
            <label className="flex min-h-11 min-w-72 items-center gap-2 rounded-lg border border-[#EFE7D8] bg-white px-3 text-sm font-semibold text-[#6A717F] max-sm:min-w-0 max-sm:flex-1">
              <RiSearchLine size={18} />
              <input
                className="min-w-0 flex-1 bg-transparent text-[#241F14] outline-none placeholder:text-[#8A8172]"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search administrators"
                type="search"
                value={search}
              />
            </label>
            <button
              className="flex min-h-11 items-center gap-2 rounded-lg bg-[#34A85B] px-4 text-sm font-bold text-white transition-[background-color,transform] duration-150 hover:bg-[#2C8F4E] active:scale-95"
              onClick={() => {
                setFormError("");
                setEditingAdmin(null);
                setIsModalOpen(true);
              }}
              type="button"
            >
              <RiAddLine size={20} />
              Add administrator
            </button>
          </div>
        </div>

        <article className="min-w-0 rounded-lg border border-[#EFE7D8] bg-white p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase text-[#34A85B]">Manage</p>
              <h3 className="mt-1 text-lg font-extrabold text-[#241F14]">Administrators</h3>
            </div>
            <span className="rounded-lg bg-[#EAF5EC] px-3 py-2 text-xs font-extrabold text-[#34A85B]">
              {rows.length} items
            </span>
          </div>

          {admins.isLoading ? (
            <p className="m-0 text-sm font-semibold text-[#8A8172]">Loading administrators...</p>
          ) : null}
          {!admins.isLoading && rows.length === 0 ? (
            <p className="m-0 text-sm font-semibold text-[#8A8172]">No administrators found.</p>
          ) : (
            <DataTable
              rows={rows}
              columns={[
                { key: "name", label: "Name" },
                { key: "email", label: "Email" },
                { key: "role", label: "Role" },
                { key: "status", label: "Status", render: (row) => <Badge value={row.status} /> },
                {
                  key: "actions",
                  label: "Actions",
                  render: (row) => {
                    const admin = adminList.find((item) => item.id === row.id);

                    return (
                      <div className="flex flex-wrap gap-2">
                        <button
                          aria-label="Edit administrator"
                          className="grid size-10 place-items-center rounded-lg border border-[#DDEFE1] bg-[#EAF5EC] text-[#34A85B] transition-[background-color,transform] duration-150 hover:bg-[#DDEFE1] active:scale-95"
                          onClick={() => {
                            if (admin) {
                              setFormError("");
                              setEditingAdmin(admin);
                              setIsModalOpen(true);
                            }
                          }}
                          type="button"
                        >
                          <RiEdit2Line size={18} />
                        </button>
                        <button
                          aria-label="Delete administrator"
                          className="grid size-10 place-items-center rounded-lg border border-[#F3C8C2] bg-[#FFF0EE] text-[#D9584A] transition-[background-color,transform] duration-150 hover:bg-[#FBE0DD] active:scale-95 disabled:opacity-60"
                          disabled={deleteAdmin.isPending}
                          onClick={() => {
                            if (!confirm(`Delete administrator ${row.email}?`)) {
                              return;
                            }

                            deleteAdmin.mutate(row.id, {
                              onSuccess: () => toast.success("Administrator deleted successfully."),
                              onError: (error) =>
                                toast.error(getErrorMessage(error, "Could not delete admin.")),
                            });
                          }}
                          type="button"
                        >
                          <RiDeleteBin6Line size={18} />
                        </button>
                      </div>
                    );
                  },
                },
              ]}
            />
          )}
        </article>
      </section>
      {isModalOpen ? (
        <AdminModal
          error={formError || createAdmin.error?.message || ""}
          initialAdmin={editingAdmin}
          isSaving={createAdmin.isPending || updateAdmin.isPending}
          onClose={closeAdminModal}
          onSubmit={handleAdminSubmit}
        />
      ) : null}
    </>
  );
}

function AdminModal({
  error,
  initialAdmin,
  isSaving,
  onClose,
  onSubmit,
}: {
  error: string;
  initialAdmin: UserRecord | null;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const isEditing = Boolean(initialAdmin);

  return (
    <div
      aria-labelledby="admin-modal-title"
      aria-modal="true"
      className="fixed inset-0 z-[70] grid min-h-dvh place-items-center bg-[#241F14]/35 px-5 py-8 backdrop-blur-sm"
      role="dialog"
    >
      <div className="w-full max-w-[460px] overflow-hidden rounded-lg border border-[#EFE7D8] bg-white shadow-[0_24px_70px_rgba(36,31,20,0.18)]">
        <div className="flex items-start justify-between gap-4 border-b border-[#EFE7D8] px-6 py-5">
          <div>
            <p className="text-xs font-extrabold uppercase text-[#34A85B]">Administrator access</p>
            <h2 id="admin-modal-title" className="mt-1 text-2xl font-extrabold text-[#241F14]">
              {isEditing ? "Edit administrator" : "Add administrator"}
            </h2>
          </div>
          <button
            aria-label="Close admin modal"
            className="grid size-10 shrink-0 place-items-center rounded-lg text-[#6A717F] transition-[background-color,color,transform] duration-150 hover:bg-[#FFF0EE] hover:text-[#D9584A] active:scale-95"
            onClick={onClose}
            type="button"
          >
            <RiCloseLine size={22} />
          </button>
        </div>

        <form className="grid gap-4 px-6 py-5" onSubmit={onSubmit}>
          <AdminField
            defaultValue={initialAdmin?.email ?? ""}
            label="Email"
            name="email"
            required
            type="email"
          />
          <AdminField
            label="Password"
            minLength={8}
            name="password"
            placeholder={isEditing ? "Leave blank to keep current password" : "Password"}
            required={!isEditing}
            type="password"
          />
          {error ? <p className="m-0 text-sm font-semibold text-[#D9584A]">{error}</p> : null}
          <div className="flex flex-wrap justify-end gap-3 border-t border-[#EFE7D8] pt-4">
            <button
              className="min-h-11 rounded-lg border border-[#EFE7D8] bg-white px-5 text-sm font-bold text-[#6A717F] transition-[background-color,transform] duration-150 hover:bg-[#FBF8F2] active:scale-95"
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#34A85B] px-5 text-sm font-bold text-white transition-[background-color,transform] duration-150 hover:bg-[#2C8F4E] active:scale-95 disabled:bg-[#A7CDB3]"
              disabled={isSaving}
              type="submit"
            >
              {isSaving ? <ButtonSpinner /> : null}
              {isSaving
                ? isEditing
                  ? "Saving..."
                  : "Creating..."
                : isEditing
                  ? "Save changes"
                  : "Create administrator"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AdminField({
  defaultValue,
  label,
  minLength,
  name,
  placeholder,
  required,
  type,
}: {
  defaultValue?: string;
  label: string;
  minLength?: number;
  name: string;
  placeholder?: string;
  required?: boolean;
  type: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-bold text-[#8A8172]">{label}</span>
      <input
        className="min-h-12 w-full rounded-lg border border-[#EFE7D8] px-3 text-sm font-semibold text-[#241F14] outline-none transition-colors placeholder:text-[#8A8172] focus:border-[#34A85B]"
        defaultValue={defaultValue}
        minLength={minLength}
        name={name}
        placeholder={placeholder ?? label}
        required={required}
        type={type}
      />
    </label>
  );
}

function AiPage({ data, error, isLoading, syncedAt }: PageProps) {
  const status = pageDataStatus(isLoading, error, "Loading AI data");

  if (status) {
    return status;
  }

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

function McpPage({ data, error, isLoading, syncedAt }: PageProps) {
  const status = pageDataStatus(isLoading, error, "Loading MCP data");

  if (status) {
    return status;
  }

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

function AnalyticsPage({ data, error, isLoading, syncedAt }: PageProps) {
  const status = pageDataStatus(isLoading, error, "Loading analytics data");

  if (status) {
    return status;
  }

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

function AuditPage({ data, error, isLoading, syncedAt }: PageProps) {
  const status = pageDataStatus(isLoading, error, "Loading audit data");

  if (status) {
    return status;
  }

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

function SettingsPage({ data, error, isLoading, syncedAt }: PageProps) {
  const status = pageDataStatus(isLoading, error, "Loading settings data");

  if (status) {
    return status;
  }

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
  error?: unknown;
  isLoading?: boolean;
  syncedAt: string;
};

function pageDataStatus(isLoading: boolean | undefined, error: unknown, message: string) {
  if (isLoading) {
    return <LoadingState message={message} />;
  }

  if (error) {
    return (
      <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
        Could not load page data.
      </p>
    );
  }

  return null;
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
