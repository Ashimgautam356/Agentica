import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { pageRoutes, type PageKey } from "../pages/pages";

type NavItem = {
  key: PageKey;
  label: string;
  group: string;
};

const navItems: NavItem[] = [
  { key: "dashboard", label: "Dashboard", group: "Overview" },
  { key: "products", label: "Products", group: "Catalog" },
  { key: "categories", label: "Categories", group: "Catalog" },
  { key: "inventory", label: "Inventory", group: "Catalog" },
  { key: "orders", label: "Orders", group: "Sales" },
  { key: "reviews", label: "Reviews", group: "Sales" },
  { key: "customers", label: "Customers", group: "Users" },
  { key: "admins", label: "Administrators", group: "Users" },
  { key: "ai", label: "AI Management", group: "AI" },
  { key: "mcp", label: "MCP Management", group: "AI" },
  { key: "analytics", label: "Analytics", group: "Monitoring" },
  { key: "audit", label: "Audit Logs", group: "Monitoring" },
  { key: "settings", label: "Settings", group: "System" },
];

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-[260px_minmax(0,1fr)] bg-slate-100 text-slate-950 max-lg:grid-cols-1">
      <aside
        className="sticky top-0 h-screen overflow-auto border-r border-slate-200 bg-slate-900 px-4 py-6 text-white max-lg:static max-lg:h-auto"
        aria-label="Admin navigation"
      >
        <div className="mb-8 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-lg bg-blue-600 font-extrabold">
            A
          </span>
          <div>
            <strong className="block">Agentica</strong>
            <span className="block text-sm text-slate-400">Admin</span>
          </div>
        </div>

        <nav className="grid gap-0.5 max-lg:grid-cols-3 max-lg:gap-2 max-sm:grid-cols-1">
          {navItems.map((item, index) => {
            const showGroup = item.group !== navItems[index - 1]?.group;

            return (
              <div key={item.key}>
                {showGroup ? (
                  <p className="mb-1.5 mt-4 text-xs font-extrabold uppercase tracking-normal text-slate-500 max-lg:hidden">
                    {item.group}
                  </p>
                ) : null}
                <NavLink
                  className={({ isActive }) =>
                    `flex min-h-10 w-full items-center rounded-lg px-3 text-left text-sm font-semibold ${
                      isActive
                        ? "bg-slate-800 text-white"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`
                  }
                  end={item.key === "dashboard"}
                  to={pageRoutes[item.key]}
                >
                  {item.label}
                </NavLink>
              </div>
            );
          })}
        </nav>
      </aside>

      <main className="min-w-0 p-7 max-sm:p-4">{children}</main>
    </div>
  );
}
