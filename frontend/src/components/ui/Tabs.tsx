"use client";

import { cn } from "@/lib/utils";

interface Tab { id: string; label: string; count?: number; icon?: React.ReactNode }

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange?: (id: string) => void;
  onTabChange?: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, onTabChange, className }: TabsProps) {
  const handleChange = onTabChange ?? onChange ?? (() => {});
  return (
    <div className={cn("border-b border-gray-200 dark:border-slate-700", className)}>
      <nav className="flex gap-0 -mb-px overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleChange(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
              tab.id === activeTab
                ? "border-primary-600 dark:border-primary-400 text-primary-600 dark:text-primary-400"
                : "border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:border-gray-300 dark:hover:border-slate-500"
            )}
          >
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && (
              <span className={cn(
                "px-1.5 py-0.5 rounded-full text-xs",
                tab.id === activeTab
                  ? "bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300"
                  : "bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400"
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
