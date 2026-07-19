"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, ClipboardList, Clock,
  TrendingUp, FolderKanban, Gift, HeartHandshake, Settings, UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/hooks/usePermissions";
import { useAuth } from "@/hooks/useAuth";
import type { Action } from "@/lib/permissions";

interface NavItem {
  label: string;
  href:  string;
  icon:  React.ElementType;
  /** If set, the item is only shown when the user has this permission */
  require?: Action;
}

// Dashboard is always visible to everyone
// "My Profile" is only for EMPLOYEE role (they don't get the full employees list)
const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard",     href: "/dashboard",     icon: LayoutDashboard },
  { label: "Employees",     href: "/employees",     icon: Users,          require: "nav:employees" },
  { label: "Tasks",         href: "/tasks",         icon: ClipboardList,  require: "nav:tasks" },
  { label: "Time",          href: "/time",          icon: Clock,          require: "nav:time" },
  { label: "Efficiency",    href: "/efficiency",    icon: TrendingUp,     require: "nav:efficiency" },
  { label: "Assets",        href: "/assets",        icon: FolderKanban,   require: "nav:assets" },
  { label: "Rewards",       href: "/rewards",       icon: Gift,           require: "nav:rewards" },
  { label: "Beneficiaries", href: "/beneficiaries", icon: HeartHandshake, require: "nav:beneficiaries" },
  { label: "Config",        href: "/settings",      icon: Settings,       require: "nav:config" },
];

export function Sidebar() {
  const pathname    = usePathname();
  const { can, role, employeeId } = usePermissions();
  const { user }   = useAuth();

  // Build the visible nav list
  const visibleItems = NAV_ITEMS.filter((item) =>
    item.require ? can(item.require) : true
  );

  // EMPLOYEE gets a "My Profile" link instead of the full Employees list
  const isEmployee = role === "EMPLOYEE";
  const myProfileHref = employeeId ? `/employees/${employeeId}` : "/dashboard";

  const roleName = user?.role?.toLowerCase().replace(/_/g, " ") ?? "";

  return (
    <aside className="w-60 shrink-0 flex flex-col h-full bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-gray-200 dark:border-slate-700 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
          <span className="text-white text-xs font-bold">HR</span>
        </div>
        <span className="text-sm font-semibold text-gray-900 dark:text-slate-100 tracking-tight">HRMS</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {/* My Profile — EMPLOYEE only */}
        {isEmployee && (
          <NavLink
            href={myProfileHref}
            label="My Profile"
            icon={UserCircle}
            pathname={pathname}
            matchExact
          />
        )}

        {visibleItems.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            pathname={pathname}
          />
        ))}
      </nav>

      {/* Footer — shows current user's role */}
      <div className="px-5 py-3 border-t border-gray-200 dark:border-slate-700">
        <p className="text-[10px] text-gray-400 dark:text-slate-500 capitalize">{roleName}</p>
        <p className="text-[10px] text-gray-300 dark:text-slate-600">HRMS v1.0.0</p>
      </div>
    </aside>
  );
}

// ── NavLink helper ─────────────────────────────────────────────────────────────

function NavLink({
  href,
  label,
  icon: Icon,
  pathname,
  matchExact = false,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  pathname: string;
  matchExact?: boolean;
}) {
  const active = matchExact
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group",
        active
          ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400"
          : "text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-slate-100"
      )}
    >
      <Icon className={cn(
        "w-4 h-4 shrink-0",
        active
          ? "text-primary-600 dark:text-primary-400"
          : "text-gray-400 dark:text-slate-500 group-hover:text-gray-600 dark:group-hover:text-slate-300"
      )} />
      <span className="flex-1">{label}</span>
      {active && <span className="w-1.5 h-1.5 rounded-full bg-primary-600 dark:bg-primary-400" />}
    </Link>
  );
}
