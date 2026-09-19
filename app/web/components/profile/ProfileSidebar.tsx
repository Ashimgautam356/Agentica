"use client";

import { Bell, CreditCard, History, KeyRound, LogOut, Shield, User, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

const menuItems = [
  { label: "Profile", icon: User, href: "/profile" },
  { label: "API Keys & MCP", icon: KeyRound, href: "/profile/api-keys" },
  { label: "Security", icon: Shield, href: "/profile/security" },
  { label: "Notifications", icon: Bell, href: "/profile/notifications" },
  { label: "Payment Methods", icon: CreditCard },
  { label: "Order History", icon: History, href: "/profile/orders" },
];

type ProfileSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function ProfileSidebar({ isOpen, onClose }: ProfileSidebarProps) {
  const logout = useAuthStore((state) => state.logout);
  const pathname = usePathname();

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
            const className = `flex h-13 items-center gap-4 rounded-md px-6 text-left text-sm font-bold transition ${
              isActive
                ? "border-l-4 border-main-green bg-[#eaf8ef] text-text-dark"
                : "text-[#7c8798] hover:bg-[#f4faf6] hover:text-text-dark"
            }`;

            return item.href ? (
              <Link className={className} href={item.href} key={item.label} onClick={onClose}>
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            ) : (
              <button className={className} type="button" key={item.label}>
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <Link
          className="mt-5 flex h-12 items-center gap-4 border-t border-[#e5ece8] px-6 pt-5 text-sm font-extrabold text-red-500"
          href="/login"
          onClick={() => {
            logout();
            onClose();
          }}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Link>
      </aside>
    </>
  );
}
