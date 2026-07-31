import { RiLogoutBoxRLine, RiMenuLine, RiUser3Line } from "@remixicon/react";
import { useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { clearAdminToken } from "../lib/adminAuth";
import { pageRoutes, pageTitles } from "../pages/pages";
import { Sidebar } from "./Sidebar";

export function Shell({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const activePage =
    Object.entries(pageRoutes).find(([, path]) =>
      path === "/dashboard"
        ? location.pathname === path
        : location.pathname === path || location.pathname.startsWith(`${path}/`),
    )?.[0] ?? "dashboard";

  return (
    <div
      className={`min-h-screen bg-[#FBF8F2] text-[#241F14] sm:grid sm:transition-[grid-template-columns] sm:duration-200 sm:ease-out ${
        isSidebarOpen ? "sm:grid-cols-[250px_minmax(0,1fr)]" : "sm:grid-cols-[72px_minmax(0,1fr)]"
      }`}
    >
      <Sidebar
        isMobileSidebarOpen={isMobileSidebarOpen}
        isSidebarOpen={isSidebarOpen}
        onCloseMobileSidebar={() => setIsMobileSidebarOpen(false)}
        onToggleSidebar={() => setIsSidebarOpen((isOpen) => !isOpen)}
      />

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex min-h-[101px] items-center justify-between gap-4 border-b border-[#EFE7D8] bg-white px-10 py-5 max-sm:min-h-[88px] max-sm:flex-wrap max-sm:px-5">
          <div className="flex items-center gap-4">
            <button
              aria-label="Open sidebar"
              className="grid size-10 place-items-center rounded-xl border border-[#EFE7D8] bg-white text-[#6A717F] transition-[background-color,color,transform] duration-150 hover:bg-[#EAF5EC] hover:text-[#34A85B] active:scale-95 sm:hidden"
              onClick={() => setIsMobileSidebarOpen(true)}
              type="button"
            >
              <RiMenuLine size={22} />
            </button>
            <div>
              <p className="text-sm font-semibold text-[#8A8172]">Admin</p>
              <h1 className="mt-1 text-3xl font-extrabold leading-none tracking-normal text-[#241F14] max-sm:text-2xl">
                {pageTitles[activePage as keyof typeof pageTitles]}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3 max-sm:w-full max-sm:justify-between">
            <div className="flex min-w-0 items-center gap-3 rounded-lg bg-[#FBF8F2] px-3 py-2">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#EAF5EC] text-[#34A85B]">
                <RiUser3Line size={20} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-extrabold text-[#241F14]">Ashim Admin</p>
                <p className="truncate text-xs font-semibold text-[#8A8172]">Super Admin</p>
              </div>
            </div>
            <button
              className="flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-bold text-[#D9584A] transition-[background-color,transform] duration-150 hover:bg-[#FFF0EE] active:scale-95"
              onClick={() => {
                clearAdminToken();
                navigate("/login");
              }}
              type="button"
            >
              <RiLogoutBoxRLine size={20} />
              Logout
            </button>
          </div>
        </header>

        <main className="min-w-0 p-10 max-sm:p-5">{children}</main>
      </div>
    </div>
  );
}
