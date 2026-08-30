"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cloudinaryImageUrl } from "@/lib/cloudinary";
import { useAuthStore } from "@/stores/auth-store";
import { cartItemCount, useCartStore } from "@/stores/cart-store";
import { useCategoryStore } from "@/stores/category-store";
import { CartDrawer } from "./cart/CartDrawer";
import { ProductSearchBar } from "./ProductSearchBar";

const navItems = [
  { label: "About", href: "/about" },
  { label: "Our Products", href: "/products" },
  { label: "Chat", href: "/#chat" },
  { label: "Contact us", href: "/contact" },
];

export function Navbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const pathname = usePathname();
  const { customer } = useAuthStore();
  const cartItems = useCartStore((state) => state.items);
  const hydrateCart = useCartStore((state) => state.hydrate);
  const hasHydratedCart = useCartStore((state) => state.hasHydrated);
  const { categories, fetchCategories } = useCategoryStore();
  const customerImage = cloudinaryImageUrl(customer?.imageId);
  const customerName =
    [customer?.firstName, customer?.lastName].filter(Boolean).join(" ") ||
    customer?.email ||
    "User";
  const hidesSearchBar = pathname.startsWith("/products") || pathname.startsWith("/profile");
  const cartCount = hasHydratedCart ? cartItemCount(cartItems) : 0;

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    hydrateCart();
  }, [hydrateCart]);

  return (
    <header className="static bg-white">
      <div className="fixed top-0 left-1/2 z-100 mx-auto flex h-20 w-full max-w-282.5 -translate-x-1/2 items-center justify-between border-b border-[#e8e8e8] bg-white px-3.5 min-[921px]:h-24 min-[921px]:border-b-0 min-[921px]:px-7">
        <button
          className="ml-1 flex h-8 w-8 flex-col items-center justify-center border-0 bg-transparent p-0 min-[921px]:hidden"
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Open menu"
          type="button"
        >
          <span className="my-0.5 block h-0.5 w-4.25 rounded-full bg-text-dark" />
          <span className="my-0.5 block h-0.5 w-4.25 rounded-full bg-text-dark" />
          <span className="my-0.5 block h-0.5 w-4.25 rounded-full bg-text-dark" />
        </button>

        <Link
          className="ml-4 flex items-center text-base font-semibold tracking-normal min-[921px]:ml-0 min-[921px]:text-3xl"
          href="/"
          aria-label="Agentica home"
        >
          <Image className="block" src={"/agentica.svg"} width={100} height={40} alt="Agentica" />
        </Link>

        <nav
          className="hidden items-center gap-9 text-[15px] font-normal min-[921px]:flex min-[921px]:text-[17px] min-[921px]:font-normal"
          aria-label="Primary navigation"
        >
          <Link className={navLinkClass(pathname, "/about")} href="/about">
            About
          </Link>
          <Link className={navLinkClass(pathname, "/products")} href="/products">
            Our Products
          </Link>
          <Link className={navLinkClass(pathname, "/#chat")} href="/#chat">
            Chat
          </Link>
          <Link className={navLinkClass(pathname, "/contact")} href="/contact">
            Contact us
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-0 min-[921px]:ml-0 min-[921px]:gap-4.5">
          {customer ? (
            <a
              className="hidden h-11 w-11 items-center justify-center overflow-hidden rounded-full border-2 border-main-green bg-[#eef8fb] text-sm font-extrabold text-text-dark shadow-[0_12px_22px_rgba(53,220,99,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_28px_rgba(53,220,99,0.24)] min-[921px]:inline-flex"
              href="/profile"
              aria-label={`${customerName} profile`}
              title={customerName}
            >
              {customerImage ? (
                <span
                  className="h-full w-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${customerImage})` }}
                  aria-hidden="true"
                />
              ) : (
                initials(customerName)
              )}
            </a>
          ) : (
            <a
              className="hidden min-h-9.5 min-w-33 items-center justify-center rounded-md bg-main-green px-6 py-3 text-[15px] font-bold text-white shadow-[0_12px_22px_rgba(53,220,99,0.22)] transition hover:-translate-y-0.5 hover:bg-main-green-hover hover:shadow-[0_16px_28px_rgba(53,220,99,0.28)] min-[921px]:inline-flex"
              href="/login"
            >
              Login / Signup
            </a>
          )}
          <button
            className="relative inline-flex items-center justify-center bg-transparent"
            type="button"
            onClick={() => setIsCartOpen(true)}
            aria-label="Cart"
          >
            <svg
              className="h-5.25 w-5.25 fill-none stroke-black stroke-[2.3] [stroke-linecap:round] [stroke-linejoin:round] min-[921px]:h-5.5 min-[921px]:w-5.5"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M5 5h2l1.4 9.2a2 2 0 0 0 2 1.8h6.9a2 2 0 0 0 2-1.6l1-5.4H8" />
              <path d="M10 20h.01M18 20h.01" />
            </svg>
            {cartCount > 0 ? (
              <span className="absolute -top-3 -right-3 grid h-5 min-w-5 place-items-center rounded-full bg-main-green px-1 text-[10px] font-extrabold text-white">
                {cartCount}
              </span>
            ) : null}
          </button>
        </div>
      </div>
      <div className="h-20 min-[921px]:h-24" aria-hidden="true" />

      <div
        className={`fixed inset-0 z-100 bg-black/35 transition-opacity duration-300 min-[921px]:hidden ${
          isSidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      <aside
        className={`fixed top-0 left-0 z-100 flex h-dvh w-80 max-w-[86vw] flex-col bg-white shadow-[18px_0_50px_rgba(9,39,68,0.16)] transition-transform duration-300 ease-out min-[921px]:hidden ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-hidden={!isSidebarOpen}
      >
        <div className="flex h-20 items-center justify-between border-b border-[#e8e8e8] px-5">
          <Link href="/" aria-label="Agentica home" onClick={() => setIsSidebarOpen(false)}>
            <Image src="/agentica.svg" width={112} height={44} alt="Agentica" />
          </Link>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef8fb] text-text-dark transition hover:bg-[#dfffea] hover:text-nav-green"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close menu"
            type="button"
          >
            <svg
              className="h-5.5 w-5.5 fill-none stroke-current stroke-2 [stroke-linecap:round] [stroke-linejoin:round]"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-2 px-5 py-6" aria-label="Mobile navigation">
          {navItems.map((item) => (
            <div key={item.label}>
              <Link
                className={`group flex items-center justify-between rounded-xl px-4 py-3.5 text-base font-semibold transition hover:bg-[#f0fff3] hover:text-nav-green ${
                  isActivePath(pathname, item.href)
                    ? "bg-[#f0fff3] text-nav-green"
                    : "text-text-dark"
                }`}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
              >
                {item.label}
                <svg
                  className="h-4.5 w-4.5 fill-none stroke-current stroke-2 opacity-40 transition group-hover:translate-x-1 group-hover:opacity-100 [stroke-linecap:round] [stroke-linejoin:round]"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </Link>
            </div>
          ))}
        </nav>

        <div className="border-t border-[#e8e8e8] p-5">
          <div className="grid grid-cols-2 gap-3">
            {customer ? (
              <a
                className="flex items-center justify-center gap-2 rounded-xl bg-text-dark px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#14395b]"
                href="/profile"
                onClick={() => setIsSidebarOpen(false)}
              >
                <span className="grid h-7 w-7 place-items-center overflow-hidden rounded-full bg-main-green text-xs text-text-dark">
                  {customerImage ? (
                    <span
                      className="h-full w-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${customerImage})` }}
                      aria-hidden="true"
                    />
                  ) : (
                    initials(customerName)
                  )}
                </span>
                Profile
              </a>
            ) : (
              <a
                className="flex items-center justify-center gap-2 rounded-xl bg-text-dark px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#14395b]"
                href="/login"
                onClick={() => setIsSidebarOpen(false)}
              >
                <svg
                  className="h-5 w-5 fill-none stroke-current stroke-2 [stroke-linecap:round] [stroke-linejoin:round]"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7 8a7 7 0 0 0-14 0" />
                </svg>
                Login
              </a>
            )}
            <button
              className="relative flex items-center justify-center gap-2 rounded-xl bg-main-green px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-main-green-hover"
              type="button"
              onClick={() => {
                setIsSidebarOpen(false);
                setIsCartOpen(true);
              }}
            >
              <svg
                className="h-5 w-5 fill-none stroke-current stroke-2 [stroke-linecap:round] [stroke-linejoin:round]"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M5 5h2l1.4 9.2a2 2 0 0 0 2 1.8h6.9a2 2 0 0 0 2-1.6l1-5.4H8" />
                <path d="M10 20h.01M18 20h.01" />
              </svg>
              Cart
              {cartCount > 0 ? (
                <span className="rounded-full bg-white px-2 py-0.5 text-xs text-[#16a34a]">
                  {cartCount}
                </span>
              ) : null}
            </button>
          </div>
        </div>
      </aside>

      {!hidesSearchBar ? (
        <div className="hidden min-[921px]:block">
          <ProductSearchBar categories={categories} />
        </div>
      ) : null}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
}

function navLinkClass(pathname: string, href: string) {
  return `transition-colors hover:text-nav-green ${
    isActivePath(pathname, href) ? "font-bold text-nav-green" : ""
  }`;
}

function isActivePath(pathname: string, href: string) {
  if (href === "/about" || href === "/contact") {
    return pathname === href;
  }

  return href.startsWith("/products") ? pathname.startsWith("/products") : false;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
