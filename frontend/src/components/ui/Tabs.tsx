"use client";

import { cn } from "@/lib/utils";

interface Tab { id: string; label: string; count?: number; icon?: React.ReactNode }

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange?: (id: string) => void;
  onTabChange?: (id: string) => void;
  className?: string;
  /** Use on dark backgrounds — switches all tab colours to white-based */
  onDark?: boolean;
}

export function Tabs({ tabs, activeTab, onChange, onTabChange, className, onDark }: TabsProps) {
  const handleChange = onTabChange ?? onChange ?? (() => {});
  return (
    <div className={cn(
      "border-b",
      onDark ? "border-white/20" : "border-gray-200 dark:border-slate-700",
      className,
    )}>
      <nav className="flex gap-0 -mb-px overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleChange(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
              onDark
                ? tab.id === activeTab
                  ? "border-white text-white"
                  : "border-transparent text-white/50 hover:text-white/80 hover:border-white/30"
                : tab.id === activeTab
                  ? "border-[#27B1AE] dark:border-[#4fc4c1] text-[#27B1AE] dark:text-[#4fc4c1]"
                  : "border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:border-gray-300 dark:hover:border-slate-500",
            )}
          >
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && (
              <span className={cn(
                "px-1.5 py-0.5 rounded-full text-xs",
                onDark
                  ? tab.id === activeTab
                    ? "bg-white/20 text-white"
                    : "bg-white/10 text-white/60"
                  : tab.id === activeTab
                    ? "bg-[#e8f7f7] dark:bg-[#27B1AE]/20 text-[#27B1AE] dark:text-[#4fc4c1]"
                    : "bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400",
              )}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}
