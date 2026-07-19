"use client";

import { useState, useMemo } from "react";

export type SortDir = "asc" | "desc";

export interface SortState {
  key: string | null;
  dir: SortDir;
}

export interface TableControls<T> {
  /** Current page of sorted data */
  rows: T[];
  sort: SortState;
  /** Toggle sort on a key — same key flips direction, new key resets to asc */
  toggleSort: (key: string) => void;
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  setPage: (p: number) => void;
}

/**
 * Combines client-side sorting and pagination for any flat array.
 *
 * Usage:
 *   const tc = useTableControls(data, { defaultSortKey: "name", pageSize: 8 });
 *   // tc.rows  → current page items (already sorted)
 *   // tc.sort  → { key, dir } for rendering sort icons
 *   // tc.toggleSort("name") → call from a column header click
 *   // tc.page / tc.totalPages / tc.setPage → feed into <Pagination>
 */
export function useTableControls<T extends Record<string, unknown>>(
  data: T[],
  {
    defaultSortKey = null,
    defaultDir = "asc",
    pageSize = 8,
  }: {
    defaultSortKey?: string | null;
    defaultDir?: SortDir;
    pageSize?: number;
  } = {}
): TableControls<T> {
  const [sort, setSort] = useState<SortState>({ key: defaultSortKey, dir: defaultDir });
  const [page, setPageRaw] = useState(1);

  const sorted = useMemo(() => {
    if (!sort.key) return data;
    const key = sort.key;
    return [...data].sort((a, b) => {
      const av = a[key];
      const bv = b[key];
      let cmp = 0;
      if (typeof av === "string" && typeof bv === "string") {
        cmp = av.localeCompare(bv, undefined, { sensitivity: "base" });
      } else if (typeof av === "number" && typeof bv === "number") {
        cmp = av - bv;
      } else if (typeof av === "boolean" && typeof bv === "boolean") {
        cmp = (av === bv ? 0 : av ? -1 : 1);
      } else {
        cmp = String(av ?? "").localeCompare(String(bv ?? ""));
      }
      return sort.dir === "asc" ? cmp : -cmp;
    });
  }, [data, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage   = Math.min(page, totalPages);
  const rows       = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  const toggleSort = (key: string) => {
    setPageRaw(1);
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" }
    );
  };

  const setPage = (p: number) => setPageRaw(Math.max(1, Math.min(p, totalPages)));

  return { rows, sort, toggleSort, page: safePage, totalPages, total: sorted.length, pageSize, setPage };
}
