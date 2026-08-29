"use client";

import { Package, ReceiptText } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, getApiError, type ApiResponse, type Paginated } from "@/lib/api";
import { formatPrice } from "@/components/products/ProductCard";
import { useAuthStore } from "@/stores/auth-store";
import { ProfileShell } from "./ProfileShell";
import { ProfileSkeleton } from "./ProfileSkeleton";

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  total: string | number;
  createdAt: string;
  items: Array<{
    id: string;
    quantity: number;
    product: { name: string };
  }>;
};

export function OrderHistoryPage() {
  const router = useRouter();
  const customer = useAuthStore((state) => state.customer);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const fetchCurrentCustomer = useAuthStore((state) => state.fetchCurrentCustomer);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (!customer?.id) {
      router.push("/login");
      return;
    }

    void fetchCurrentCustomer();
  }, [customer?.id, fetchCurrentCustomer, hasHydrated, router]);

  useEffect(() => {
    if (!hasHydrated || !customer?.id) {
      return;
    }

    const controller = new AbortController();

    async function fetchOrders() {
      setIsLoading(true);
      setError("");

      try {
        const response = await api.get<ApiResponse<Paginated<Order>>>("/orders", {
          signal: controller.signal,
          params: { page: 1, pageSize: 20 },
        });
        setOrders(response.data.data.items);
      } catch (error) {
        if (!controller.signal.aborted) {
          setError(getApiError(error, "Could not load orders."));
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void fetchOrders();

    return () => controller.abort();
  }, [customer?.id, hasHydrated]);

  if (!hasHydrated || !customer) {
    return (
      <ProfileShell>
        <ProfileSkeleton />
      </ProfileShell>
    );
  }

  return (
    <ProfileShell>
      <section className="max-w-235">
        <h1 className="text-3xl font-extrabold text-text-dark">Order History</h1>
        <p className="mt-1 text-sm text-[#7c8798]">Review your recent Agentica purchases.</p>

        {isLoading ? (
          <div className="mt-8 grid gap-3">
            {Array.from({ length: 4 }, (_, index) => (
              <div className="h-24 animate-pulse rounded-md bg-[#eef4f1]" key={index} />
            ))}
          </div>
        ) : error ? (
          <p className="mt-8 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </p>
        ) : orders.length === 0 ? (
          <div className="mt-8 grid min-h-64 place-items-center rounded-md border border-dashed border-[#cfd9d4] bg-white p-8 text-center">
            <div>
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#e8f8ed] text-[#16a34a]">
                <Package className="h-7 w-7" />
              </div>
              <p className="mt-4 text-base font-extrabold text-text-dark">No orders yet.</p>
              <Link
                className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-main-green px-5 text-sm font-extrabold text-white transition hover:bg-main-green-hover"
                href="/products"
              >
                Browse Products
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-8 overflow-hidden rounded-md border border-[#dfe6e3] bg-white">
            {orders.map((order) => (
              <article
                className="grid gap-4 border-b border-[#edf1ef] p-5 last:border-b-0 min-[780px]:grid-cols-[1fr_auto]"
                key={order.id}
              >
                <div className="flex gap-4">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#e8f8ed] text-[#16a34a]">
                    <ReceiptText className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-base font-extrabold text-text-dark">
                        Order #{shortOrder(order.orderNumber)}
                      </h2>
                      <span className="rounded-full bg-[#eef8fb] px-3 py-1 text-[11px] font-extrabold text-[#16a34a]">
                        {formatStatus(order.status)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-[#7c8798]">{formatDate(order.createdAt)}</p>
                    <p className="mt-2 text-sm font-semibold text-[#526273]">
                      {order.items.length} {order.items.length === 1 ? "item" : "items"} ·{" "}
                      {order.items
                        .slice(0, 2)
                        .map((item) => item.product.name)
                        .join(", ")}
                    </p>
                  </div>
                </div>
                <div className="min-[780px]:text-right">
                  <p className="text-sm font-semibold text-[#7c8798]">Total</p>
                  <p className="mt-1 text-xl font-extrabold text-[#16a34a]">
                    Rs {formatPrice(order.total)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </ProfileShell>
  );
}

function shortOrder(orderNumber: string) {
  return orderNumber.slice(0, 8);
}

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}
