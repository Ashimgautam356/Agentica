"use client";

import { CheckCircle2, CreditCard, LoaderCircle, LockKeyhole, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { z } from "zod";
import { formatPrice } from "@/components/products/ProductCard";
import { api, getApiError, type ApiResponse } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { cartTotal, useCartStore } from "@/stores/cart-store";
import type { CartItem } from "@/stores/cart-store";
import type { Product } from "@/components/products/types";

type Order = {
  id: string;
  total: string | number;
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
};

type PaymentResult = {
  success: boolean;
  transactionId: string;
  status: "PAID" | "FAILED";
};

const checkoutSchema = z.object({
  shippingName: z.string().trim().min(1, "Enter the recipient's name.").max(120),
  shippingContact: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "Contact number must be exactly 10 digits."),
  shippingAddress: z
    .string()
    .trim()
    .min(5, "Shipping address must be at least 5 characters.")
    .max(240),
  cardNumber: z
    .string()
    .transform((value) => value.replace(/\s/g, ""))
    .pipe(z.string().regex(/^\d{13,19}$/, "Enter a valid card number.")),
  expiryMonth: z.string().regex(/^(0[1-9]|1[0-2])$/, "Select an expiry month."),
  expiryYear: z.string().regex(/^\d{4}$/, "Select an expiry year."),
  cvv: z.string().regex(/^\d{3,4}$/, "Enter a valid CVV."),
});

export function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const buyNowProductId = searchParams.get("buyNow");
  const buyNowQuantity = Math.max(1, Math.min(999, Number(searchParams.get("quantity")) || 1));
  const customer = useAuthStore((state) => state.customer);
  const hasAuthHydrated = useAuthStore((state) => state.hasHydrated);
  const items = useCartStore((state) => state.items);
  const hasCartHydrated = useCartStore((state) => state.hasHydrated);
  const hydrateCart = useCartStore((state) => state.hydrate);
  const clearCart = useCartStore((state) => state.clearCart);
  const showToast = useCartStore((state) => state.showToast);
  const [orderId, setOrderId] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [completedItems, setCompletedItems] = useState<CartItem[]>([]);
  const [buyNowItems, setBuyNowItems] = useState<CartItem[]>([]);
  const [isBuyNowLoading, setIsBuyNowLoading] = useState(Boolean(buyNowProductId));
  const [cardNumber, setCardNumber] = useState("4111 1111 1111 1111");
  const [expiryMonth, setExpiryMonth] = useState("12");
  const [expiryYear, setExpiryYear] = useState(String(new Date().getFullYear() + 2));
  const [cvv, setCvv] = useState("123");
  const [shippingName, setShippingName] = useState<string | null>(null);
  const [shippingContact, setShippingContact] = useState<string | null>(null);
  const [shippingAddress, setShippingAddress] = useState<string | null>(null);

  useEffect(() => {
    hydrateCart();
  }, [hydrateCart]);

  useEffect(() => {
    if (hasAuthHydrated && !customer) {
      router.replace("/login");
    }
  }, [customer, hasAuthHydrated, router]);

  useEffect(() => {
    if (!buyNowProductId) return;

    const controller = new AbortController();
    api
      .get<ApiResponse<Product>>(`/products/${buyNowProductId}`, { signal: controller.signal })
      .then(({ data }) => {
        setBuyNowItems([
          {
            productId: data.data.id,
            name: data.data.name,
            imageId: data.data.imageId,
            price: Number(data.data.price),
            quantity: buyNowQuantity,
          },
        ]);
      })
      .catch((requestError) => {
        if (!controller.signal.aborted) {
          setError(getApiError(requestError, "Could not load this product."));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsBuyNowLoading(false);
      });

    return () => controller.abort();
  }, [buyNowProductId, buyNowQuantity]);

  const checkoutItems = buyNowProductId ? buyNowItems : items;

  async function submitPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResult(null);

    if (!customer || checkoutItems.length === 0) {
      setError("There are no products to check out.");
      return;
    }

    const parsed = checkoutSchema.safeParse({
      shippingName:
        shippingName ??
        ([customer.firstName, customer.lastName].filter(Boolean).join(" ") || customer.email),
      shippingContact: shippingContact ?? customer.contact ?? "",
      shippingAddress: shippingAddress ?? customer.address ?? "",
      cardNumber,
      expiryMonth,
      expiryYear,
      cvv,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check your checkout details.");
      return;
    }

    setIsPaying(true);

    try {
      let paymentOrderId = orderId;
      const { shippingName, shippingContact, shippingAddress, ...paymentDetails } = parsed.data;

      if (!paymentOrderId) {
        const orderResponse = await api.post<ApiResponse<Order>>("/orders", {
          items: checkoutItems.map(({ productId, quantity }) => ({ productId, quantity })),
          shippingName,
          shippingContact,
          shippingAddress,
        });
        paymentOrderId = orderResponse.data.data.id;
        setOrderId(paymentOrderId);
      }

      const paymentResponse = await api.post<ApiResponse<PaymentResult>>("/payments/process", {
        orderId: paymentOrderId,
        ...paymentDetails,
      });
      const payment = paymentResponse.data.data;
      setResult(payment);

      if (payment.success) {
        setCompletedItems(checkoutItems);
        if (!buyNowProductId) clearCart();
        showToast("Payment successful. Your order has been placed.", "success");
      }
    } catch (paymentError) {
      setError(getApiError(paymentError, "Payment could not be processed."));
    } finally {
      setIsPaying(false);
    }
  }

  if (!hasAuthHydrated || !hasCartHydrated || isBuyNowLoading || !customer) {
    return <main className="mx-auto min-h-[60vh] max-w-282.5 animate-pulse px-5 py-12" />;
  }

  if (checkoutItems.length === 0 && !result?.success) {
    return (
      <main className="mx-auto grid min-h-[60vh] max-w-282.5 place-items-center px-5 py-12 text-center">
        <div>
          <CreditCard className="mx-auto h-12 w-12 text-main-green" />
          <h1 className="mt-4 text-3xl font-extrabold">Your cart is empty</h1>
          <Link
            className="mt-5 inline-flex rounded-md bg-main-green px-6 py-3 font-bold text-white"
            href="/products"
          >
            Browse products
          </Link>
        </div>
      </main>
    );
  }

  const summaryItems = result?.success ? completedItems : checkoutItems;
  const total = cartTotal(summaryItems);

  return (
    <main className="bg-[#f7faf8] px-5 py-10 min-[900px]:py-16">
      <div className="mx-auto max-w-282.5">
        <div className="mb-8">
          <p className="text-sm font-bold text-[#16a34a]">Secure checkout</p>
          <h1 className="mt-1 text-3xl font-extrabold min-[700px]:text-4xl">Complete your order</h1>
        </div>

        <div className="grid gap-7 min-[900px]:grid-cols-[1fr_390px]">
          <form
            className="rounded-xl border border-[#dfe6e3] bg-white p-5 shadow-sm min-[700px]:p-8"
            onSubmit={submitPayment}
          >
            <fieldset className="mb-8 grid gap-4 border-b border-[#e5ebe8] pb-8 min-[700px]:grid-cols-2">
              <legend className="mb-4 text-xl font-extrabold">Delivery details</legend>
              <label className="text-sm font-bold">
                Full name
                <input
                  className="mt-2 h-12 w-full rounded-md border border-[#cad5d0] px-4"
                  value={
                    shippingName ??
                    ([customer.firstName, customer.lastName].filter(Boolean).join(" ") ||
                      customer.email)
                  }
                  onChange={(event) => setShippingName(event.target.value)}
                  maxLength={120}
                  required
                />
              </label>
              <label className="text-sm font-bold">
                Contact number
                <input
                  className="mt-2 h-12 w-full rounded-md border border-[#cad5d0] px-4"
                  value={shippingContact ?? customer.contact ?? ""}
                  onChange={(event) =>
                    setShippingContact(event.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  inputMode="numeric"
                  pattern="\d{10}"
                  maxLength={10}
                  required
                />
              </label>
              <label className="text-sm font-bold min-[700px]:col-span-2">
                Shipping address
                <textarea
                  className="mt-2 min-h-24 w-full rounded-md border border-[#cad5d0] px-4 py-3"
                  value={shippingAddress ?? customer.address ?? ""}
                  onChange={(event) => setShippingAddress(event.target.value)}
                  maxLength={240}
                  minLength={5}
                  required
                />
              </label>
            </fieldset>

            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[#e8f8ed] text-[#16a34a]">
                <CreditCard className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-xl font-extrabold">Card details</h2>
                <p className="text-sm text-[#7c8798]">Mock gateway · no real charge will be made</p>
              </div>
            </div>

            <label className="mt-7 block text-sm font-bold" htmlFor="cardNumber">
              Card number
            </label>
            <input
              className="mt-2 h-12 w-full rounded-md border border-[#cad5d0] px-4 outline-none focus:border-main-green focus:ring-3 focus:ring-main-green/15"
              id="cardNumber"
              inputMode="numeric"
              autoComplete="cc-number"
              value={cardNumber}
              onChange={(event) => setCardNumber(formatCardNumber(event.target.value))}
              maxLength={23}
              required
            />

            <div className="mt-5 grid grid-cols-3 gap-3">
              <label className="text-sm font-bold">
                Month
                <select
                  className="mt-2 h-12 w-full rounded-md border border-[#cad5d0] bg-white px-3"
                  value={expiryMonth}
                  onChange={(event) => setExpiryMonth(event.target.value)}
                >
                  {Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, "0")).map(
                    (month) => (
                      <option key={month}>{month}</option>
                    ),
                  )}
                </select>
              </label>
              <label className="text-sm font-bold">
                Year
                <select
                  className="mt-2 h-12 w-full rounded-md border border-[#cad5d0] bg-white px-3"
                  value={expiryYear}
                  onChange={(event) => setExpiryYear(event.target.value)}
                >
                  {Array.from({ length: 12 }, (_, index) =>
                    String(new Date().getFullYear() + index),
                  ).map((year) => (
                    <option key={year}>{year}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-bold" htmlFor="cvv">
                CVV
                <input
                  className="mt-2 h-12 w-full rounded-md border border-[#cad5d0] px-3"
                  id="cvv"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  value={cvv}
                  onChange={(event) => setCvv(event.target.value.replace(/\D/g, "").slice(0, 4))}
                  required
                />
              </label>
            </div>

            <div className="mt-6 rounded-md bg-[#f3f7f5] p-4 text-sm">
              <p>
                <strong>Success:</strong> 4111 1111 1111 1111
              </p>
              <p className="mt-1">
                <strong>Failure:</strong> 4000 0000 0000 0002
              </p>
            </div>

            {error ? (
              <p
                role="alert"
                className="mt-5 rounded-md border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700"
              >
                {error}
              </p>
            ) : null}
            {result ? (
              <div
                role="status"
                className={`mt-5 flex gap-3 rounded-md border p-4 ${result.success ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800"}`}
              >
                {result.success ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 shrink-0" />
                )}
                <div>
                  <p className="font-extrabold">
                    Payment {result.success ? "successful" : "failed"}
                  </p>
                  <p className="mt-1 break-all text-xs">Reference: {result.transactionId}</p>
                </div>
              </div>
            ) : null}

            {result?.success ? (
              <Link
                className="mt-6 grid h-12 place-items-center rounded-md bg-main-green font-extrabold text-white"
                href="/profile/orders"
              >
                View your orders
              </Link>
            ) : (
              <button
                className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-md bg-main-green font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isPaying}
                type="submit"
              >
                {isPaying ? (
                  <LoaderCircle className="h-5 w-5 animate-spin" />
                ) : (
                  <LockKeyhole className="h-4 w-4" />
                )}
                {isPaying ? "Processing…" : `Pay Rs ${formatPrice(total)}`}
              </button>
            )}
          </form>

          <aside className="h-fit rounded-xl border border-[#dfe6e3] bg-white p-5 shadow-sm min-[700px]:p-6">
            <h2 className="text-xl font-extrabold">Order summary</h2>
            <div className="mt-5 space-y-4">
              {summaryItems.map((item) => (
                <div className="flex justify-between gap-4 text-sm" key={item.productId}>
                  <span className="text-[#526273]">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="shrink-0 font-bold">
                    Rs {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-between border-t border-[#e5ebe8] pt-5 text-lg font-extrabold">
              <span>Total</span>
              <span className="text-[#16a34a]">Rs {formatPrice(total)}</span>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function formatCardNumber(value: string) {
  return value
    .replace(/\D/g, "")
    .slice(0, 19)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}
