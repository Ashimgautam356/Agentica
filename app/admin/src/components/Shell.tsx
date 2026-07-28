import {
  RiArchiveStackFill,
  RiArchiveStackLine,
  RiBarChartBoxFill,
  RiBarChartBoxLine,
  RiCloseLine,
  RiDashboardHorizontalFill,
  RiDashboardHorizontalLine,
  RiFileList3Fill,
  RiFileList3Line,
  RiLayoutGridFill,
  RiLayoutGridLine,
  RiMenuFoldLine,
  RiMenuLine,
  RiMenuUnfoldLine,
  RiPlug2Fill,
  RiPlug2Line,
  RiReceiptFill,
  RiReceiptLine,
  RiRobot2Fill,
  RiRobot2Line,
  RiSettings4Fill,
  RiSettings4Line,
  RiShieldUserFill,
  RiShieldUserLine,
  RiShoppingBag3Fill,
  RiShoppingBag3Line,
  RiStarSmileFill,
  RiStarSmileLine,
  RiTeamFill,
  RiTeamLine,
  type RemixiconComponentType,
} from "@remixicon/react";
import { useState, type ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import logoUrl from "../assets/agentica.svg";
import { pageRoutes, pageTitles, type PageKey } from "../pages/pages";

type IconName =
  | "overview"
  | "package"
  | "grid"
  | "warehouse"
  | "receipt"
  | "star"
  | "users"
  | "shield"
  | "spark"
  | "plug"
  | "chart"
  | "file"
  | "settings";

type NavItem = {
  key: PageKey;
  label: string;
  group: string;
  icon: IconName;
  color: string;
  tint: string;
};

const navItems: NavItem[] = [
  {
    key: "dashboard",
    label: "Overview",
    group: "Main",
    icon: "overview",
    color: "#34A85B",
    tint: "#EAF5EC",
  },
  {
    key: "products",
    label: "Products",
    group: "Commerce",
    icon: "package",
    color: "#E8A33D",
    tint: "#FFF4E4",
  },
  {
    key: "categories",
    label: "Categories",
    group: "Commerce",
    icon: "grid",
    color: "#34A85B",
    tint: "#EAF5EC",
  },
  {
    key: "inventory",
    label: "Inventory",
    group: "Commerce",
    icon: "warehouse",
    color: "#6D6962",
    tint: "#F1EEE8",
  },
  {
    key: "orders",
    label: "Orders",
    group: "Sales",
    icon: "receipt",
    color: "#E8A33D",
    tint: "#FFF4E4",
  },
  {
    key: "reviews",
    label: "Reviews",
    group: "Sales",
    icon: "star",
    color: "#E8A33D",
    tint: "#FFF4E4",
  },
  {
    key: "customers",
    label: "Customers",
    group: "People",
    icon: "users",
    color: "#34A85B",
    tint: "#EAF5EC",
  },
  {
    key: "admins",
    label: "Administrators",
    group: "People",
    icon: "shield",
    color: "#6D6962",
    tint: "#F1EEE8",
  },
  {
    key: "ai",
    label: "AI Management",
    group: "Platform",
    icon: "spark",
    color: "#E8A33D",
    tint: "#FFF4E4",
  },
  {
    key: "mcp",
    label: "MCP Management",
    group: "Platform",
    icon: "plug",
    color: "#34A85B",
    tint: "#EAF5EC",
  },
  {
    key: "analytics",
    label: "Analytics",
    group: "Monitoring",
    icon: "chart",
    color: "#E8A33D",
    tint: "#FFF4E4",
  },
  {
    key: "audit",
    label: "Audit Logs",
    group: "Monitoring",
    icon: "file",
    color: "#6D6962",
    tint: "#F1EEE8",
  },
  {
    key: "settings",
    label: "Settings",
    group: "System",
    icon: "settings",
    color: "#34A85B",
    tint: "#EAF5EC",
  },
];

const iconMap: Record<IconName, { fill: RemixiconComponentType; line: RemixiconComponentType }> = {
  overview: { fill: RiDashboardHorizontalFill, line: RiDashboardHorizontalLine },
  package: { fill: RiShoppingBag3Fill, line: RiShoppingBag3Line },
  grid: { fill: RiLayoutGridFill, line: RiLayoutGridLine },
  warehouse: { fill: RiArchiveStackFill, line: RiArchiveStackLine },
  receipt: { fill: RiReceiptFill, line: RiReceiptLine },
  star: { fill: RiStarSmileFill, line: RiStarSmileLine },
  users: { fill: RiTeamFill, line: RiTeamLine },
  shield: { fill: RiShieldUserFill, line: RiShieldUserLine },
  spark: { fill: RiRobot2Fill, line: RiRobot2Line },
  plug: { fill: RiPlug2Fill, line: RiPlug2Line },
  chart: { fill: RiBarChartBoxFill, line: RiBarChartBoxLine },
  file: { fill: RiFileList3Fill, line: RiFileList3Line },
  settings: { fill: RiSettings4Fill, line: RiSettings4Line },
};

export function Shell({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const activeItem =
    navItems.find((item) => {
      const path = pageRoutes[item.key];
      return path === "/dashboard"
        ? location.pathname === path
        : location.pathname === path || location.pathname.startsWith(`${path}/`);
    }) ?? navItems[0];

  return (
    <div
      className={`min-h-screen bg-[#FBF8F2] text-[#241F14] sm:grid sm:transition-[grid-template-columns] sm:duration-200 sm:ease-out ${
        isSidebarOpen ? "sm:grid-cols-[250px_minmax(0,1fr)]" : "sm:grid-cols-[72px_minmax(0,1fr)]"
      }`}
    >
      <aside
        className="sticky top-0 z-40 hidden h-screen overflow-visible border-r border-[#EFE7D8] bg-white text-[#6A717F] sm:block"
        aria-label="Admin navigation"
      >
        <div
          className={`flex h-[101px] items-center border-b border-[#EFE7D8] transition-[padding] duration-200 ${
            isSidebarOpen ? "justify-between px-7" : "justify-center px-0"
          }`}
        >
          {isSidebarOpen ? (
            <img className="h-auto w-[126px]" src={logoUrl} alt="Agentica Admin" />
          ) : null}
          <button
            aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            className="grid size-10 place-items-center rounded-xl text-[#6A717F] transition-[background-color,color,transform] duration-150 hover:bg-[#EAF5EC] hover:text-[#34A85B] active:scale-95"
            onClick={() => setIsSidebarOpen((isOpen) => !isOpen)}
            type="button"
          >
            {isSidebarOpen ? <RiMenuFoldLine size={20} /> : <RiMenuUnfoldLine size={20} />}
          </button>
        </div>

        <nav className="mt-3 grid gap-1 px-3 pb-6">
          {navItems.map((item, index) => {
            const showGroup = item.group !== navItems[index - 1]?.group;
            const separateCollapsedGroup = showGroup && index > 0 && !isSidebarOpen;

            return (
              <div className={`relative ${separateCollapsedGroup ? "mt-5" : ""}`} key={item.key}>
                {showGroup && (isSidebarOpen || isMobileSidebarOpen) ? (
                  <p className="mb-2 mt-5 px-4 text-[11px] font-bold uppercase tracking-normal text-[#8A8172]">
                    {item.group}
                  </p>
                ) : null}
                <NavLink
                  className={({ isActive }) =>
                    `group/nav relative flex min-h-[46px] items-center gap-4 rounded-[10px] text-sm font-semibold transition-[background-color,color,box-shadow] duration-150 ${
                      isSidebarOpen ? "px-4" : "justify-center px-0"
                    } ${
                      isActive
                        ? "bg-[#EAF5EC] text-[#241F14]"
                        : "text-[#6A717F] hover:bg-[#FBF8F2] hover:text-[#241F14]"
                    }`
                  }
                  end={item.key === "dashboard"}
                  title={isSidebarOpen ? undefined : item.label}
                  to={pageRoutes[item.key]}
                >
                  {({ isActive }) => (
                    <>
                      {isActive ? (
                        <span className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-[#34A85B]" />
                      ) : null}
                      <span
                        className={`grid shrink-0 place-items-center rounded-xl transition-[background-color,color,transform] duration-150 group-hover/nav:scale-105 ${
                          isSidebarOpen ? "size-8" : "size-11"
                        }`}
                        style={{
                          backgroundColor: !isSidebarOpen || isActive ? item.tint : undefined,
                          color: !isSidebarOpen || isActive ? item.color : undefined,
                        }}
                      >
                        <NavIcon filled={!isSidebarOpen && isActive} name={item.icon} />
                      </span>
                      {isSidebarOpen ? <span className="truncate">{item.label}</span> : null}
                      {!isSidebarOpen ? (
                        <span className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 z-50 -translate-y-1/2 rounded-lg bg-[#241F14] px-3 py-2 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover/nav:opacity-100">
                          {item.label}
                        </span>
                      ) : null}
                    </>
                  )}
                </NavLink>
              </div>
            );
          })}
        </nav>
      </aside>

      <aside
        aria-label="Mobile admin navigation"
        className={`fixed inset-0 z-50 h-dvh w-full overflow-auto bg-white text-[#6A717F] transition-transform duration-200 ease-out sm:hidden ${
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[88px] items-center justify-between border-b border-[#EFE7D8] px-6">
          <img className="h-auto w-[138px]" src={logoUrl} alt="Agentica Admin" />
          <button
            aria-label="Close sidebar"
            className="grid size-11 place-items-center rounded-xl text-[#6A717F] transition-[background-color,color,transform] duration-150 hover:bg-[#EAF5EC] hover:text-[#34A85B] active:scale-95"
            onClick={() => setIsMobileSidebarOpen(false)}
            type="button"
          >
            <RiCloseLine size={24} />
          </button>
        </div>

        <nav className="grid gap-1 px-5 pb-8 pt-3">
          {navItems.map((item, index) => {
            const showGroup = item.group !== navItems[index - 1]?.group;

            return (
              <div className="relative" key={item.key}>
                {showGroup ? (
                  <p className="mb-2 mt-5 px-4 text-[11px] font-bold uppercase tracking-normal text-[#8A8172]">
                    {item.group}
                  </p>
                ) : null}
                <NavLink
                  className={({ isActive }) =>
                    `relative flex min-h-[52px] items-center gap-4 rounded-[12px] px-4 text-sm font-semibold transition-[background-color,color] duration-150 ${
                      isActive
                        ? "bg-[#EAF5EC] text-[#241F14]"
                        : "text-[#6A717F] hover:bg-[#FBF8F2] hover:text-[#241F14]"
                    }`
                  }
                  end={item.key === "dashboard"}
                  onClick={() => setIsMobileSidebarOpen(false)}
                  to={pageRoutes[item.key]}
                >
                  {({ isActive }) => (
                    <>
                      {isActive ? (
                        <span className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-[#34A85B]" />
                      ) : null}
                      <span
                        className="grid size-10 shrink-0 place-items-center rounded-xl"
                        style={{
                          backgroundColor: isActive ? item.tint : "#FBF8F2",
                          color: isActive ? item.color : "#6A717F",
                        }}
                      >
                        <NavIcon filled={isActive} name={item.icon} />
                      </span>
                      <span className="truncate">{item.label}</span>
                    </>
                  )}
                </NavLink>
              </div>
            );
          })}
        </nav>
      </aside>

      <div className="min-w-0">
        <header className="flex items-start justify-between px-10 pb-4 pt-9 max-sm:px-5 max-sm:pt-7">
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
                {pageTitles[activeItem.key]}
              </h1>
            </div>
          </div>
        </header>

        <main className="min-w-0 p-10 max-sm:p-5">{children}</main>
      </div>
    </div>
  );
}

function NavIcon({ filled, name }: { filled: boolean; name: IconName }) {
  const Icon = filled ? iconMap[name].fill : iconMap[name].line;

  return <Icon size={22} />;
}
