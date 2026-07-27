"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  pages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, pages, total, limit, onPageChange }: PaginationProps) {
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to   = Math.min(page * limit, total);

  const getPageNumbers = () => {
    if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
    if (page <= 4) return [1, 2, 3, 4, 5, "…", pages];
    if (page >= pages - 3) return [1, "…", pages - 4, pages - 3, pages - 2, pages - 1, pages];
    return [1, "…", page - 1, page, page + 1, "…", pages];
  };

  return (
    <div className="flex items-center justify-between px-1">
      <p className="text-sm text-gray-500 dark:text-slate-400">
        Showing <span className="font-medium text-gray-700 dark:text-slate-300">{from}–{to}</span> of{" "}
        <span className="font-medium text-gray-700 dark:text-slate-300">{total}</span> results
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className={cn(
            "flex items-center justify-center w-8 h-8 rounded-lg text-sm transition-colors",
            "text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700",
            "disabled:opacity-40 disabled:cursor-not-allowed"
          )}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {getPageNumbers().map((p, i) =>
          p === "…" ? (
            <span key={`dots-${i}`} className="w-8 text-center text-sm text-gray-400 dark:text-slate-500">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={cn(
                "w-8 h-8 rounded-lg text-sm font-medium transition-colors",
                p === page
                  ? "bg-[#f9701a] text-white dark:bg-[#ea5a10]"
                  : "text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700"
              )}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === pages}
          className={cn(
            "flex items-center justify-center w-8 h-8 rounded-lg text-sm transition-colors",
            "text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700",
            "disabled:opacity-40 disabled:cursor-not-allowed"
          )}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
