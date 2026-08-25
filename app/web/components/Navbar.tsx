"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const categoryColumns = [
  ["category 1", "category 2", "category 3", "category 4", "category 5"],
  ["like wise"],
  ["like wise"],
];

const navItems = ["About", "Our Products", "Our Category", "Chat", "Contact us"];

export function Navbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <header className="static bg-white">
      <div className="relative z-100 mx-auto flex h-20 max-w-282.5 items-center justify-between border-b border-[#e8e8e8] bg-white px-3.5 min-[921px]:h-24 min-[921px]:border-b-0 min-[921px]:px-7">
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
          <a className="transition-colors hover:text-nav-green" href="#">
            About
          </a>
          <a className="transition-colors hover:text-nav-green" href="#">
            Our Products
          </a>
          <div className="group static">
            <a className="transition-colors group-hover:text-nav-green" href="#">
              Our Category
            </a>
            <div
              className="pointer-events-none absolute top-14 left-1/2 z-70 min-h-72 w-169.25 max-w-[88vw] -translate-x-1/2 translate-y-4.5 opacity-0 transition duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100"
              aria-label="Product categories"
            >
              <div className="relative grid min-h-72 grid-cols-3 overflow-hidden bg-[#f2fff3] px-8 pt-7 pb-9.5 shadow-[0_18px_50px_rgba(9,39,68,0.08)]">
                {categoryColumns.map((items, index) => (
                  <div
                    className={`flex flex-col gap-4 text-base font-semibold text-[#526273] ${
                      index > 0 ? "border-l border-[#244253] pl-13" : "pl-4.5"
                    }`}
                    key={index}
                  >
                    {items.map((item) => (
                      <a className="transition-colors hover:text-nav-green" href="#" key={item}>
                        {item}
                      </a>
                    ))}
                  </div>
                ))}
                <a
                  className="absolute right-6.5 bottom-3 text-base font-bold text-[#6c6c6c] underline transition-colors hover:text-nav-green"
                  href="#"
                >
                  see more
                </a>
              </div>
            </div>
          </div>
          <a className="transition-colors hover:text-nav-green" href="#">
            Chat
          </a>
          <a className="transition-colors hover:text-nav-green" href="#">
            Contact us
          </a>
        </nav>

        <div className="ml-auto flex items-center gap-0 min-[921px]:ml-0 min-[921px]:gap-4.5">
          <a
            className="hidden min-h-9.5 min-w-33 items-center justify-center rounded-md bg-main-green px-6 py-3 text-[15px] font-bold text-white shadow-[0_12px_22px_rgba(53,220,99,0.22)] transition hover:-translate-y-0.5 hover:bg-main-green-hover hover:shadow-[0_16px_28px_rgba(53,220,99,0.28)] min-[921px]:inline-flex"
            href="#"
          >
            ShopNow
          </a>
          <a
            className="hidden items-center justify-center bg-transparent min-[921px]:inline-flex"
            href="#"
            aria-label="Account"
          >
            <svg
              className="h-5.5 w-5.5 fill-none stroke-black stroke-[2.3] [stroke-linecap:round] [stroke-linejoin:round]"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7 8a7 7 0 0 0-14 0" />
            </svg>
          </a>
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
            <span className="absolute -top-1.75 -right-1 h-1.75 w-1.75 rounded-full bg-[#ff654a]" />
          </a>
        </div>
      </div>

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
            <a
              className="group flex items-center justify-between rounded-xl px-4 py-3.5 text-base font-semibold text-text-dark transition hover:bg-[#f0fff3] hover:text-nav-green"
              href="#"
              key={item}
              onClick={() => setIsSidebarOpen(false)}
            >
              {item}
              <svg
                className="h-4.5 w-4.5 fill-none stroke-current stroke-2 opacity-40 transition group-hover:translate-x-1 group-hover:opacity-100 [stroke-linecap:round] [stroke-linejoin:round]"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </a>
          ))}
        </nav>

        <div className="border-t border-[#e8e8e8] p-5">
          <div className="grid grid-cols-2 gap-3">
            <a
              className="flex items-center justify-center gap-2 rounded-xl bg-text-dark px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#14395b]"
              href="#"
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
              <span className="absolute top-2.5 right-4 h-1.75 w-1.75 rounded-full bg-[#ff654a]" />
            </a>
          </div>
        </div>
      </aside>

      <div className="relative z-10 hidden h-13.25 bg-[#eef8fb] min-[921px]:block">
        <div className="mx-auto flex h-full max-w-268 items-center gap-0.75 px-5.5">
          <button
            className="flex h-10.25 basis-33.5 items-center justify-center gap-2.5 rounded-l-full border-0 bg-white text-[13px] font-semibold text-placeholder"
            type="button"
          >
            <svg
              className="h-4.25 w-4.25 fill-none stroke-current stroke-2 [stroke-linecap:round] [stroke-linejoin:round]"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M8 6h10M8 12h10M8 18h10M4 6h.01M4 12h.01M4 18h.01" />
            </svg>
            All Categories
          </button>
          <form className="flex h-10.25 flex-1 items-center overflow-hidden rounded-r-full border-0 bg-white">
            <label className="sr-only" htmlFor="site-search">
              Search products
            </label>
            <input
              className="h-full w-full border-0 px-5 text-xs font-semibold text-text-dark outline-0 placeholder:text-placeholder"
              id="site-search"
              type="search"
              placeholder="What are you looking for ?"
            />
            <button
              className="inline-flex h-10.25 w-12.5 cursor-pointer items-center justify-center rounded-r-full border-0 bg-main-green text-white"
              type="submit"
              aria-label="Search"
            >
              <svg
                className="h-4.25 w-4.25 fill-none stroke-current stroke-2 [stroke-linecap:round] [stroke-linejoin:round]"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="m21 21-4.3-4.3M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
