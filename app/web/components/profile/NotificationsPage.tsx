"use client";

import { Bell, CheckCheck, LoaderCircle, Package } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useNotificationStore } from "@/stores/notification-store";
import { ProfileShell } from "./ProfileShell";
import { ProfileSkeleton } from "./ProfileSkeleton";

export function NotificationsPage() {
  const router = useRouter();
  const customer = useAuthStore((state) => state.customer);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const { items, unreadCount, isLoading, error, fetchNotifications, markRead, markAllRead } =
    useNotificationStore();

  useEffect(() => {
    if (!hasHydrated) return;
    if (!customer) {
      router.replace("/login");
      return;
    }

    void fetchNotifications();
  }, [customer, fetchNotifications, hasHydrated, router]);

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
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-text-dark">Notifications</h1>
            <p className="mt-1 text-sm text-[#7c8798]">Order status updates from Agentica.</p>
          </div>
          {unreadCount > 0 ? (
            <button
              className="inline-flex h-10 items-center gap-2 rounded-md border border-[#dfe6e3] px-4 text-sm font-extrabold text-[#526273] transition hover:border-main-green hover:text-[#16a34a]"
              type="button"
              onClick={() => void markAllRead()}
            >
              <CheckCheck className="h-4 w-4" />
              Mark all as read
            </button>
          ) : null}
        </div>

        {error ? (
          <p className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </p>
        ) : null}

        {isLoading ? (
          <div className="mt-8 grid min-h-48 place-items-center text-[#16a34a]">
            <LoaderCircle className="h-7 w-7 animate-spin" aria-label="Loading notifications" />
          </div>
        ) : items.length === 0 ? (
          <div className="mt-8 grid min-h-64 place-items-center rounded-xl border border-dashed border-[#cfd9d4] bg-[#f8fbf9] p-8 text-center">
            <div>
              <Bell className="mx-auto h-10 w-10 text-main-green" />
              <h2 className="mt-4 text-lg font-extrabold">You’re all caught up</h2>
              <p className="mt-1 text-sm text-[#7c8798]">Order updates will appear here.</p>
            </div>
          </div>
        ) : (
          <div className="mt-8 overflow-hidden rounded-xl border border-[#dfe6e3] bg-white">
            {items.map((notification) => (
              <article
                className={`flex gap-4 border-b border-[#e9eeeb] p-5 last:border-b-0 ${notification.isRead ? "bg-white" : "bg-[#f1fbf4]"}`}
                key={notification.id}
              >
                <div className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#e8f8ed] text-[#16a34a]">
                  <Package className="h-5 w-5" />
                  {!notification.isRead ? (
                    <span className="absolute top-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-red-500" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h2 className="font-extrabold text-text-dark">{notification.title}</h2>
                    <time className="text-xs font-semibold text-[#9aa4b2]">
                      {formatNotificationTime(notification.createdAt)}
                    </time>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-[#687487]">{notification.message}</p>
                  <div className="mt-3 flex items-center gap-4 text-xs font-extrabold">
                    <Link className="text-[#16a34a] hover:underline" href="/profile/orders">
                      View order
                    </Link>
                    {!notification.isRead ? (
                      <button
                        className="text-[#637083] hover:text-text-dark"
                        type="button"
                        onClick={() => void markRead(notification.id)}
                      >
                        Mark as read
                      </button>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </ProfileShell>
  );
}

function formatNotificationTime(value: string) {
  const date = new Date(value);
  const elapsed = Date.now() - date.getTime();
  const minutes = Math.floor(elapsed / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
