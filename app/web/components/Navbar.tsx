"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cloudinaryImageUrl } from "@/lib/cloudinary";
import { useAuthStore } from "@/stores/auth-store";
import { useCategoryStore } from "@/stores/category-store";
import { ProductSearchBar } from "./ProductSearchBar";

const fallbackCategoryColumns = [
  ["Fresh Produce", "Dairy & Eggs", "Bakery", "Meat & Seafood", "Frozen Foods"],
  ["Pantry Staples", "Snacks", "Beverages", "Breakfast", "Organic Foods"],
  ["Baby Care", "Personal Care", "Household", "Pet Supplies", "Health & Wellness"],
];

const navItems = [
  { label: "About", href: "/#about" },
  { label: "Our Products", href: "/products" },
  { label: "Our Category", href: "/#categories" },
  { label: "Chat", href: "/#chat" },
  { label: "Contact us", href: "/#contact" },
];

export function Navbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { customer } = useAuthStore();
  const { categories, fetchCategories } = useCategoryStore();
  const customerImage = cloudinaryImageUrl(customer?.imageId);
  const customerName =
    [customer?.firstName, customer?.lastName].filter(Boolean).join(" ") ||
    customer?.email ||
    "User";
  const categoryNames = categories.map((category) => category.name);
  const categoryColumns =
    categoryNames.length > 0 ? chunkCategories(categoryNames) : fallbackCategoryColumns;
  const isProductsPage = pathname.startsWith("/products");

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

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
          <Link className={navLinkClass(pathname, "/#about")} href="/#about">
            About
          </Link>
          <Link className={navLinkClass(pathname, "/products")} href="/products">
            Our Products
          </Link>
          <div className="group static">
            <Link className={navLinkClass(pathname, "/#categories")} href="/#categories">
              Our Category
            </Link>
            <div
              className="pointer-events-none absolute top-14 left-1/2 z-70 min-h-72 w-169.25 max-w-[88vw] -translate-x-1/2 translate-y-4.5 opacity-0 transition duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100"
              aria-label="Product categories"
            >
              <div className="relative grid min-h-72 grid-cols-3 overflow-hidden bg-[#f7f6f6] px-8 pt-7 pb-9.5 shadow-[0_18px_50px_rgba(9,39,68,0.08)]">
                {categoryColumns.map((items, index) => (
                  <div
                    className={`flex flex-col gap-4 text-base font-semibold text-[#526273] ${
                      index > 0 ? "border-l border-[#244253] pl-13" : "pl-4.5"
                    }`}
                    key={index}
                  >
                    {items.map((item) => (
                      <Link
                        className="transition-colors hover:text-nav-green"
                        href="/#categories"
                        key={item}
                      >
                        {item}
                      </Link>
                    ))}
                  </div>
                ))}
                <Link
                  className="absolute right-6.5 bottom-3 text-base font-bold text-[#6c6c6c] underline transition-colors hover:text-nav-green"
                  href="/#categories"
                >
                  see more
                </Link>
              </div>
            </div>
          </div>
          <Link className={navLinkClass(pathname, "/#chat")} href="/#chat">
            Chat
          </Link>
          <Link className={navLinkClass(pathname, "/#contact")} href="/#contact">
            Contact us
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-0 min-[921px]:ml-0 min-[921px]:gap-4.5">
          {customer ? (
            <a
              className="hidden h-11 w-11 items-center justify-center overflow-hidden rounded-full border-2 border-main-green bg-[#eef8fb] text-sm font-extrabold text-text-dark shadow-[0_12px_22px_rgba(53,220,99,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_28px_rgba(53,220,99,0.24)] min-[921px]:inline-flex"
              href="#profile"
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
          <a
            className="relative inline-flex items-center justify-center bg-transparent"
            href="#"
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
          </a>
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
              {item.label === "Our Category" ? (
                <div className="mt-1 grid grid-cols-2 gap-1 px-4 text-sm font-semibold text-[#526273]">
                  {categoryColumns
                    .flat()
                    .slice(0, 8)
                    .map((category) => (
                      <Link
                        className="rounded-lg px-3 py-2 transition hover:bg-[#f0fff3] hover:text-nav-green"
                        href="/#categories"
                        key={category}
                        onClick={() => setIsSidebarOpen(false)}
                      >
                        {category}
                      </Link>
                    ))}
                </div>
              ) : null}
            </div>
          ))}
        </nav>

        <div className="border-t border-[#e8e8e8] p-5">
          <div className="grid grid-cols-2 gap-3">
            {customer ? (
              <a
                className="flex items-center justify-center gap-2 rounded-xl bg-text-dark px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#14395b]"
                href="#profile"
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
            <a
              className="relative flex items-center justify-center gap-2 rounded-xl bg-main-green px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-main-green-hover"
              href="#"
              onClick={() => setIsSidebarOpen(false)}
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
            </a>
          </div>
        </div>
      </aside>

      {!isProductsPage ? (
        <div className="hidden min-[921px]:block">
          <ProductSearchBar categories={categories} />
        </div>
      ) : null}
    </header>
  );
}

function navLinkClass(pathname: string, href: string) {
  return `transition-colors hover:text-nav-green ${
    isActivePath(pathname, href) ? "font-bold text-nav-green" : ""
  }`;
}

function isActivePath(pathname: string, href: string) {
  return href.startsWith("/products") ? pathname.startsWith("/products") : false;
}

function chunkCategories(categories: string[]) {
  const columns = [[], [], []] as string[][];

  categories.forEach((category, index) => {
    columns[index % columns.length].push(category);
  });

  return columns;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
