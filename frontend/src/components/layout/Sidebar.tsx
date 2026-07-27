"use client";

import { useState } from "react";
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
  require?: Action;
}

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
  const [expanded, setExpanded] = useState(false);
  const pathname                = usePathname();
  const { can, role, employeeId } = usePermissions();
  const { user }                = useAuth();

  const visibleItems = NAV_ITEMS.filter((item) =>
    item.require ? can(item.require) : true
  );

  const isEmployee    = role === "EMPLOYEE";
  const myProfileHref = employeeId ? `/employees/${employeeId}` : "/dashboard";
  const roleName      = user?.role?.toLowerCase().replace(/_/g, " ") ?? "";

  return (
    <aside
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className={cn(
        "fixed left-0 top-0 z-40 flex flex-col h-full",
        "bg-[#2C3E50]",
        "transition-[width] duration-200 ease-in-out overflow-hidden",
        expanded ? "w-60 shadow-2xl shadow-black/50" : "w-16",
      )}
    >
      {/* ── Brand ─────────────────────────────────────────────────── */}
      <div className={cn(
        "flex items-center h-16 shrink-0 border-b border-white/10",
        "transition-[padding] duration-200",
        expanded ? "px-5 gap-3" : "justify-center px-0",
      )}>
        {/* Logo mark */}
        <div className="w-8 h-8 rounded-lg bg-[#f9701a] flex items-center justify-center shrink-0 shadow-lg shadow-[#f9701a]/30">
          <span className="text-white text-xs font-bold tracking-tight">HR</span>
        </div>
        {/* Logo text */}
        <div className={cn(
          "min-w-0 transition-[opacity,max-width] duration-150",
          expanded ? "opacity-100 max-w-xs delay-75" : "opacity-0 max-w-0 overflow-hidden",
        )}>
          <span className="text-white text-sm font-semibold tracking-tight whitespace-nowrap">HRMS</span>
          <p className="text-[10px] text-slate-400/60 whitespace-nowrap">Human Resources</p>
        </div>
      </div>

      {/* ── Nav ───────────────────────────────────────────────────── */}
      <nav className={cn(
        "flex-1 py-4 space-y-0.5 overflow-y-auto overflow-x-hidden",
        "transition-[padding] duration-200",
        expanded ? "px-3" : "px-2",
      )}>
        {isEmployee && (
          <NavLink
            href={myProfileHref}
            label="My Profile"
            icon={UserCircle}
            pathname={pathname}
            expanded={expanded}
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
            expanded={expanded}
          />
        ))}
      </nav>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <div className={cn(
        "shrink-0 border-t border-white/10",
        "transition-[padding] duration-200",
        expanded ? "px-5 py-3.5" : "px-0 py-3.5 flex justify-center",
      )}>
        {expanded ? (
          <div className={cn(
            "transition-opacity duration-150",
            expanded ? "opacity-100 delay-75" : "opacity-0",
          )}>
            <p className="text-xs text-slate-200/80 capitalize font-medium">{roleName}</p>
            <p className="text-[10px] text-slate-400/50 mt-0.5">HRMS v1.0.0</p>
          </div>
        ) : (
          <div
            className="w-2 h-2 rounded-full bg-emerald-400"
            title={roleName}
          />
        )}
      </div>
    </aside>
  );
}

// ── NavLink ────────────────────────────────────────────────────────────────────

function NavLink({
  href, label, icon: Icon, pathname, expanded, matchExact = false,
}: {
  href: string; label: string; icon: React.ElementType;
  pathname: string; expanded: boolean; matchExact?: boolean;
}) {
  const active = matchExact
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      title={expanded ? undefined : label}
      className={cn(
        "flex items-center py-2.5 rounded-xl text-sm font-medium group",
        "transition-all duration-150",
        expanded ? "px-3 gap-3" : "justify-center px-2",
        active
          ? "bg-[#f9701a]/20 text-[#fdba74]"
          : "text-slate-400/70 hover:bg-white/[0.08] hover:text-slate-200",
      )}
    >
      {/* Icon */}
      <Icon className={cn(
        "w-[18px] h-[18px] shrink-0 transition-colors",
        active
          ? "text-[#fdba74]"
          : "text-slate-400/50 group-hover:text-slate-200",
      )} />

      {/* Label */}
      <span className={cn(
        "flex-1 whitespace-nowrap transition-[opacity,max-width] duration-150 overflow-hidden",
        expanded ? "opacity-100 max-w-xs delay-75" : "opacity-0 max-w-0",
      )}>
        {label}
      </span>

      {/* Active indicator dot */}
      {active && expanded && (
        <span className="w-1.5 h-1.5 rounded-full bg-[#fdba74] shrink-0" />
      )}
    </Link>
  );
}
