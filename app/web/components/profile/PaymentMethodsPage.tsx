"use client";

import { CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { ProfileShell } from "./ProfileShell";
import { ProfileSkeleton } from "./ProfileSkeleton";

export function PaymentMethodsPage() {
  const router = useRouter();
  const customer = useAuthStore((state) => state.customer);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  useEffect(() => {
    if (hasHydrated && !customer) router.replace("/login");
  }, [customer, hasHydrated, router]);

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
        <h1 className="text-3xl font-extrabold text-text-dark">Payment Method</h1>
        <p className="mt-1 text-sm text-[#7c8798]">
          The single test card used by the mock gateway.
        </p>

        <article className="mt-8 max-w-md rounded-xl bg-[linear-gradient(135deg,#092744,#16466c)] p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <CreditCard className="h-8 w-8 text-main-green" />
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold">DEMO CARD</span>
          </div>
          <p className="mt-10 text-xl tracking-[0.14em]">4111 1111 1111 1111</p>
          <div className="mt-6 flex justify-between text-sm">
            <div>
              <p className="text-xs text-white/60">EXPIRES</p>
              <p className="mt-1 font-bold">12/30</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/60">CVV</p>
              <p className="mt-1 font-bold">123</p>
            </div>
          </div>
        </article>

        <p className="mt-4 max-w-md text-xs leading-5 text-[#7c8798]">
          This is public test data for the mock gateway. No real card is charged or saved.
        </p>
      </section>
    </ProfileShell>
  );
}
