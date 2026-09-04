"use client";

import { Bell, CreditCard, History, KeyRound, LogOut, User, Wrench, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useNotificationStore } from "@/stores/notification-store";

const menuItems = [
  { label: "Profile", icon: User, href: "/profile", iconColor: "green" },
  { label: "API Keys & MCP", icon: KeyRound, href: "/profile/api-keys", iconColor: "orange" },
  { label: "Security", icon: Wrench, href: "/profile/security", iconColor: "red" },
  { label: "Notifications", icon: Bell, href: "/profile/notifications", iconColor: "blue" },
  { label: "Payment Methods", icon: CreditCard, href: "/profile/payment", iconColor: "purple" },
  { label: "Order History", icon: History, href: "/profile/orders", iconColor: "green" },
] as const;

const itemColors = {
  green: {
    active: "border-emerald-300 bg-emerald-50 text-emerald-600",
    hover: "hover:bg-emerald-50 hover:text-emerald-500",
  },
  orange: {
    active: "border-amber-300 bg-amber-50 text-amber-600",
    hover: "hover:bg-amber-50 hover:text-amber-500",
  },
  red: {
    active: "border-rose-300 bg-rose-50 text-rose-600",
    hover: "hover:bg-rose-50 hover:text-rose-500",
  },
  blue: {
    active: "border-sky-300 bg-sky-50 text-sky-600",
    hover: "hover:bg-sky-50 hover:text-sky-500",
  },
  purple: {
    active: "border-violet-300 bg-violet-50 text-violet-600",
    hover: "hover:bg-violet-50 hover:text-violet-500",
  },
};

type ProfileSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function ProfileSidebar({ isOpen, onClose }: ProfileSidebarProps) {
  const logout = useAuthStore((state) => state.logout);
  const pathname = usePathname();
  const unreadCount = useNotificationStore((state) => state.unreadCount);

  return (
    <>
      <div
        className={`fixed inset-0 z-[90] bg-black/35 transition-opacity min-[900px]:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed top-0 left-0 z-[100] flex h-dvh w-80 max-w-[86vw] flex-col border-r border-[#e5ece8] bg-white px-3 py-10 transition-transform duration-300 min-[900px]:static min-[900px]:z-auto min-[900px]:h-auto min-[900px]:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-5 flex justify-end min-[900px]:hidden">
          <button
            className="grid h-10 w-10 place-items-center rounded-full bg-[#eef8fb] text-text-dark"
            type="button"
            onClick={onClose}
            aria-label="Close profile menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-2" aria-label="Profile menu">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === pathname;
            const className = `flex h-13 items-center gap-4 rounded-md px-6 text-left text-md font-bold transition-colors ${
              isActive
                ? `border-l-4 ${itemColors[item.iconColor].active}`
                : `text-[#7c8798] ${itemColors[item.iconColor].hover}`
            }`;

            return (
              <Link className={className} href={item.href} key={item.label} onClick={onClose}>
                <Icon className="h-5 w-5 transition-colors" />
                {item.label}
                {item.href === "/profile/notifications" && unreadCount > 0 ? (
                  <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-extrabold text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <Link
          className="mt-5 flex h-12 items-center gap-4 border-t border-[#e5ece8] px-6 pt-5 text-md font-extrabold text-red-500"
          href="/login"
          onClick={() => {
            logout();
            onClose();
          }}
        >
          <LogOut className="h-5 w-5" />
          Logout
        </Link>
      </aside>
    </>
  );
}
