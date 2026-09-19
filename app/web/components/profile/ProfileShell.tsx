"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useState } from "react";
import { ProfileSidebar } from "./ProfileSidebar";

type ProfileShellProps = {
  children: ReactNode;
};

export function ProfileShell({ children }: ProfileShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-white min-[921px]:min-h-[calc(100vh-6rem)]">
      <div className="mx-auto grid max-w-282.5 min-[900px]:grid-cols-[280px_1fr]">
        <ProfileSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <section className="px-5 py-8 min-[760px]:px-10 min-[900px]:px-16">
          <div className="mb-6 flex items-center justify-between min-[900px]:justify-end">
            <button
              className="inline-flex h-10 items-center gap-2 rounded-md border border-[#dfe6e3] px-3 text-sm font-extrabold text-text-dark min-[900px]:hidden"
              type="button"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-4 w-4" />
              Menu
            </button>
            <Link
              className="grid h-10 w-10 place-items-center rounded-full bg-[#eef8fb] text-text-dark transition hover:bg-[#dfffea] hover:text-nav-green"
              href="/"
              aria-label="Back to home"
            >
              <X className="h-5 w-5" />
            </Link>
          </div>

          {children}
        </section>
      </div>
    </main>
  );
}
