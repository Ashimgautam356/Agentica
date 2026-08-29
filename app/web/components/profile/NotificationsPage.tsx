"use client";

import { Bell, CheckCircle2, Package, Percent } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { ProfileShell } from "./ProfileShell";
import { ProfileSkeleton } from "./ProfileSkeleton";

const notifications = [
  {
    icon: Package,
    title: "Order updates",
    description: "Track confirmations, shipping, and delivery changes.",
    time: "Today",
  },
  {
    icon: Percent,
    title: "Fresh deals",
    description: "Get notified when products in your favorite categories go on sale.",
    time: "This week",
  },
  {
    icon: CheckCircle2,
    title: "Account alerts",
    description: "Important changes like password updates and API key activity.",
    time: "Always on",
  },
];

export function NotificationsPage() {
  const router = useRouter();
  const customer = useAuthStore((state) => state.customer);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const fetchCurrentCustomer = useAuthStore((state) => state.fetchCurrentCustomer);

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

  if (!hasHydrated || !customer) {
    return (
      <ProfileShell>
        <ProfileSkeleton />
      </ProfileShell>
    );
  }

  return (
    <ProfileShell>
      <section className="max-w-210">
        <h1 className="text-3xl font-extrabold text-text-dark">Notifications</h1>
        <p className="mt-1 text-sm text-[#7c8798]">
          Choose what Agentica should keep you updated about.
        </p>

        <div className="mt-8 grid gap-4">
          {notifications.map((notification) => {
            const Icon = notification.icon;

            return (
              <article
                className="flex flex-col gap-4 rounded-md border border-[#dfe6e3] bg-white p-5 min-[640px]:flex-row min-[640px]:items-center min-[640px]:justify-between"
                key={notification.title}
              >
                <div className="flex gap-4">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#e8f8ed] text-[#16a34a]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-text-dark">
                      {notification.title}
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-[#687487]">
                      {notification.description}
                    </p>
                    <p className="mt-2 text-xs font-bold text-[#9aa4b2]">{notification.time}</p>
                  </div>
                </div>
                <label className="inline-flex cursor-pointer items-center gap-3 self-start min-[640px]:self-center">
                  <input className="peer sr-only" type="checkbox" defaultChecked />
                  <span className="h-6 w-11 rounded-full bg-[#dfe6e3] p-1 transition peer-checked:bg-main-green">
                    <span className="block h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5" />
                  </span>
                </label>
              </article>
            );
          })}
        </div>

        <div className="mt-6 rounded-md border border-[#dfe6e3] bg-[#f8fbf9] p-5">
          <div className="flex gap-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-text-dark">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-text-dark">Quiet shopping</h2>
              <p className="mt-1 text-sm leading-6 text-[#687487]">
                Marketing notifications are optional. Account security alerts will still be shown
                when needed.
              </p>
            </div>
          </div>
        </div>
      </section>
    </ProfileShell>
  );
}
