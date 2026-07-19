"use client";

import { LogOut, User, ChevronDown, Sun, Moon, Shield } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { useTheme } from "@/providers/ThemeProvider";
import { cn } from "@/lib/utils";
import { ROLE_LABELS, ROLE_COLORS, type UserRole } from "@/lib/permissions";

export function Header() {
  const { user, logout, logoutPending } = useAuth();
  const { role, employeeId } = usePermissions();
  const { resolvedTheme, toggleTheme } = useTheme();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials = user?.employee?.fullName
    ? user.employee.fullName.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "U";

  return (
    <header className="h-16 flex items-center justify-end gap-2 px-6 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 shrink-0">
      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="p-2 rounded-lg text-gray-400 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-700 dark:hover:text-slate-200 transition-colors"
        title={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      >
        {resolvedTheme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>

      {/* User menu */}
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center">
            <span className="text-primary-700 dark:text-primary-400 text-xs font-semibold">{initials}</span>
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-sm font-medium text-gray-900 dark:text-slate-100 leading-none">
              {user?.employee?.fullName ?? user?.email ?? "—"}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              {role && (
                <span className={cn(
                  "text-[10px] font-semibold px-1.5 py-0.5 rounded-full leading-none",
                  ROLE_COLORS[role as UserRole].bg,
                  ROLE_COLORS[role as UserRole].text,
                )}>
                  {ROLE_LABELS[role as UserRole]}
                </span>
              )}
            </div>
          </div>
          <ChevronDown className={cn("w-4 h-4 text-gray-400 dark:text-slate-500 transition-transform", open && "rotate-180")} />
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 py-1 z-50">
            <div className="px-4 py-2.5 border-b border-gray-100 dark:border-slate-700">
              <p className="text-xs font-medium text-gray-900 dark:text-slate-100 truncate">
                {user?.employee?.fullName ?? user?.email}
              </p>
              {user?.employee && (
                <p className="text-xs text-gray-500 dark:text-slate-400 truncate mt-0.5">
                  {user.employee.designation.title} · {user.employee.department.name}
                </p>
              )}
            </div>
            <button
              className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
              onClick={() => {
                setOpen(false);
                if (employeeId) router.push(`/employees/${employeeId}`);
              }}
            >
              <User className="w-4 h-4" /> My Profile
            </button>
            {role && (
              <div className="px-4 py-2 flex items-center gap-2 text-xs text-gray-400 dark:text-slate-500">
                <Shield className="w-3.5 h-3.5" />
                <span>{ROLE_LABELS[role as UserRole]}</span>
              </div>
            )}
            <button
              disabled={logoutPending}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-60"
              onClick={() => { setOpen(false); logout(); }}
            >
              <LogOut className="w-4 h-4" />
              {logoutPending ? "Signing out…" : "Sign out"}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
