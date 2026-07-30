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
import { NavLink } from "react-router-dom";
import logoUrl from "../assets/agentica.svg";
import { pageRoutes, type PageKey } from "../pages/pages";

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

type SidebarProps = {
  isSidebarOpen: boolean;
  isMobileSidebarOpen: boolean;
  onCloseMobileSidebar: () => void;
  onToggleSidebar: () => void;
};

export function Sidebar({
  isSidebarOpen,
  isMobileSidebarOpen,
  onCloseMobileSidebar,
  onToggleSidebar,
}: SidebarProps) {
  return (
    <>
      <aside
        className="sticky top-0 z-40 hidden h-screen overflow-hidden border-r border-[#EFE7D8] bg-white text-[#6A717F] sm:block"
        aria-label="Admin navigation"
      >
        <div className="flex h-full min-w-0 flex-col">
          <DesktopSidebarHeader isOpen={isSidebarOpen} onToggle={onToggleSidebar} />
          <SidebarNav isOpen={isSidebarOpen} />
        </div>
      </aside>

      <aside
        aria-label="Mobile admin navigation"
        className={`fixed inset-0 z-50 h-dvh w-full overflow-x-hidden overflow-y-auto bg-white text-[#6A717F] transition-transform duration-200 ease-out [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:hidden ${
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <MobileSidebarHeader onClose={onCloseMobileSidebar} />
        <SidebarNav isMobile onNavigate={onCloseMobileSidebar} />
      </aside>
    </>
  );
}

function DesktopSidebarHeader({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) {
  return (
    <div
      className={`flex h-[101px] shrink-0 items-center border-b border-[#EFE7D8] bg-white transition-[padding] duration-200 ${
        isOpen ? "justify-between px-7" : "justify-center px-0"
      }`}
    >
      {isOpen ? <img className="h-auto w-[126px]" src={logoUrl} alt="Agentica Admin" /> : null}
      <button
        aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        className="grid size-10 place-items-center rounded-xl text-[#6A717F] transition-[background-color,color,transform] duration-150 hover:bg-[#EAF5EC] hover:text-[#34A85B] active:scale-95"
        onClick={onToggle}
        type="button"
      >
        {isOpen ? <RiMenuFoldLine size={20} /> : <RiMenuUnfoldLine size={20} />}
      </button>
    </div>
  );
}

function MobileSidebarHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex h-[88px] items-center justify-between border-b border-[#EFE7D8] px-6">
      <img className="h-auto w-[138px]" src={logoUrl} alt="Agentica Admin" />
      <button
        aria-label="Close sidebar"
        className="grid size-11 place-items-center rounded-xl text-[#6A717F] transition-[background-color,color,transform] duration-150 hover:bg-[#EAF5EC] hover:text-[#34A85B] active:scale-95"
        onClick={onClose}
        type="button"
      >
        <RiCloseLine size={24} />
      </button>
    </div>
  );
}

function SidebarNav({
  isMobile,
  isOpen = true,
  onNavigate,
}: {
  isMobile?: boolean;
  isOpen?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <nav
      className={
        isMobile
          ? "grid min-w-0 gap-1 px-5 pb-8 pt-3"
          : "mt-3 grid min-w-0 flex-1 content-start gap-1 overflow-x-hidden overflow-y-auto px-3 pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      }
    >
      {navItems.map((item, index) => {
        const showGroup = item.group !== navItems[index - 1]?.group;
        const separateCollapsedGroup = showGroup && index > 0 && !isOpen;

        return (
          <div className={`relative ${separateCollapsedGroup ? "mt-5" : ""}`} key={item.key}>
            {showGroup && (isOpen || isMobile) ? (
              <p className="mb-2 mt-5 px-4 text-[11px] font-bold uppercase tracking-normal text-[#8A8172]">
                {item.group}
              </p>
            ) : null}
            <NavLink
              className={({ isActive }) =>
                `group/nav relative flex min-w-0 items-center gap-4 font-semibold transition-[background-color,color,box-shadow] duration-150 ${
                  isMobile
                    ? "min-h-[52px] rounded-[12px] px-4 text-sm"
                    : `min-h-[46px] rounded-[10px] text-sm ${
                        isOpen ? "px-4" : "justify-center px-0"
                      }`
                } ${
                  isActive
                    ? "bg-[#EAF5EC] text-[#241F14]"
                    : "text-[#6A717F] hover:bg-[#FBF8F2] hover:text-[#241F14]"
                }`
              }
              end={item.key === "dashboard"}
              onClick={onNavigate}
              title={!isMobile && !isOpen ? item.label : undefined}
              to={pageRoutes[item.key]}
            >
              {({ isActive }) => (
                <>
                  {isActive ? (
                    <span className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-[#34A85B]" />
                  ) : null}
                  <span
                    className={`grid shrink-0 place-items-center rounded-xl transition-[background-color,color,transform] duration-150 group-hover/nav:scale-105 ${
                      isMobile ? "size-10" : isOpen ? "size-8" : "size-11"
                    }`}
                    style={{
                      backgroundColor: !isOpen || isMobile || isActive ? item.tint : undefined,
                      color: !isOpen || isMobile || isActive ? item.color : undefined,
                    }}
                  >
                    <NavIcon filled={!isOpen && isActive} name={item.icon} />
                  </span>
                  {isOpen || isMobile ? <span className="truncate">{item.label}</span> : null}
                  {!isMobile && !isOpen ? (
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
  );
}

function NavIcon({ filled, name }: { filled: boolean; name: IconName }) {
  const Icon = filled ? iconMap[name].fill : iconMap[name].line;

  return <Icon size={22} />;
}
