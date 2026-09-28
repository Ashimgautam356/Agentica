import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  categoriesQueryOptions,
  customersQueryOptions,
  ordersQueryOptions,
  productsQueryOptions,
  reviewsQueryOptions,
} from "./queryOptions";
import type { AdminData } from "./types";

export const emptyAdminData: AdminData = {
  generatedAt: new Date().toISOString(),
  stats: [],
  revenue: [],
  activities: [],
  products: [],
  categories: [],
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

export function useAdminData(enabled = true) {
  const categories = useQuery({ ...categoriesQueryOptions(), enabled });
  const products = useQuery({ ...productsQueryOptions(), enabled });
  const orders = useQuery({ ...ordersQueryOptions(), enabled });
  const reviews = useQuery({ ...reviewsQueryOptions(), enabled });
  const customers = useQuery({ ...customersQueryOptions(), enabled });
  const isLoading =
    categories.isLoading ||
    products.isLoading ||
    orders.isLoading ||
    reviews.isLoading ||
    customers.isLoading;
  const error =
    categories.error ?? products.error ?? orders.error ?? reviews.error ?? customers.error ?? null;
  const data = useMemo<AdminData>(() => {
    const productRecords = products.data?.items ?? [];
    const categoryRecords = categories.data?.items ?? [];
    const orderRecords = orders.data?.items ?? [];
    const reviewRecords = reviews.data?.items ?? [];
    const customerRecords = customers.data?.items ?? [];
    const productCounts = new Map<string, number>();

    for (const product of productRecords) {
      productCounts.set(product.categoryId, (productCounts.get(product.categoryId) ?? 0) + 1);
    }

    return {
      ...emptyAdminData,
      generatedAt: new Date().toISOString(),
      stats: [
        { label: "Products", value: String(products.data?.total ?? 0), note: "Live catalog count" },
        { label: "Orders", value: String(orders.data?.total ?? 0), note: "Live order count" },
        { label: "Reviews", value: String(reviews.data?.total ?? 0), note: "Live review count" },
        {
          label: "Customers",
          value: String(customers.data?.total ?? 0),
          note: "Live customer count",
        },
      ],
      products: productRecords.map((product) => ({
        name: product.name,
        sku: product.skuId,
        category: product.category?.name ?? product.categoryId,
        price: `Rs ${product.price}`,
        status: "Active",
      })),
      categories: categoryRecords.map((category) => ({
        name: category.name,
        products: category._count?.products ?? productCounts.get(category.id) ?? 0,
        parent: "-",
        status: "Active",
      })),
      orders: orderRecords.map((order) => ({
        id: order.orderNumber,
        customer:
          [order.user.firstName, order.user.lastName].filter(Boolean).join(" ") ||
          order.user.email ||
          order.shippingName,
        total: `Rs ${order.total}`,
        payment: order.payments[0]?.status ?? "PENDING",
        status: order.status,
      })),
      reviews: reviewRecords.map((review) => ({
        product: review.product.name,
        rating: String(review.rating),
        customer:
          [review.user.firstName, review.user.lastName].filter(Boolean).join(" ") || "Customer",
        status: "Published",
      })),
      customers: customerRecords.map((user) => ({
        name: [user.firstName, user.lastName].filter(Boolean).join(" ") || "Customer",
        email: user.email ?? "-",
        orders: 0,
        status: "Active",
      })),
    };
  }, [categories.data, customers.data, orders.data, products.data, reviews.data]);

  return {
    data,
    error,
    isLoading,
  };
}
