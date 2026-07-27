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
    <header className="h-14 flex items-center justify-end gap-1.5 px-5 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 shrink-0">
      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="p-2 rounded-lg text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-700/40 hover:text-gray-700 dark:hover:text-slate-200 transition-colors"
        title={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      >
        {resolvedTheme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>

      {/* Divider */}
      <span className="w-px h-5 bg-gray-200 dark:bg-slate-700 mx-1" />

      {/* User menu */}
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 hover:bg-gray-100 dark:hover:bg-slate-700/40 transition-colors"
        >
          {/* Avatar ring */}
          <div className="w-8 h-8 rounded-full bg-primary-600 dark:bg-primary-500 ring-2 ring-primary-600/20 dark:ring-primary-500/20 flex items-center justify-center shadow-sm">
            <span className="text-white text-xs font-semibold leading-none">{initials}</span>
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
              {user?.employee?.fullName ?? user?.email ?? "—"}
            </p>
            {role && (
              <p className="text-[10px] text-gray-500 dark:text-slate-400 font-medium mt-0.5">
                {ROLE_LABELS[role as UserRole]}
              </p>
            )}
          </div>
          <ChevronDown className={cn("w-3.5 h-3.5 text-gray-400 dark:text-slate-500 transition-transform ml-0.5", open && "rotate-180")} />
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-1.5 w-58 bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-black/8 dark:shadow-black/30 border border-gray-100 dark:border-slate-700 py-1.5 z-50 min-w-[220px]">
            {/* User info */}
            <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700/60">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#f9701a] flex items-center justify-center shrink-0">
                  <span className="text-white text-xs font-semibold">{initials}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 truncate">
                    {user?.employee?.fullName ?? user?.email}
                  </p>
                  {user?.employee && (
                    <p className="text-xs text-gray-500 dark:text-slate-400 truncate mt-0.5">
                      {user.employee.designation.title}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="py-1">
              <button
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                onClick={() => { setOpen(false); if (employeeId) router.push(`/employees/${employeeId}`); }}
              >
                <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                  <User className="w-3.5 h-3.5 text-gray-500 dark:text-slate-400" />
                </div>
                My Profile
              </button>
            </div>

            <div className="border-t border-gray-100 dark:border-slate-700/60 pt-1 pb-0.5">
              <button
                disabled={logoutPending}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-60"
                onClick={() => { setOpen(false); logout(); }}
              >
                <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center shrink-0">
                  <LogOut className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
                </div>
                {logoutPending ? "Signing out…" : "Sign out"}
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
