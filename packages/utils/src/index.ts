// ── Date helpers ───────────────────────────────────────────────────
export function calcYearsBetween(start: Date, end: Date = new Date()): number {
  const ms = end.getTime() - start.getTime();
  return Math.round((ms / (1000 * 60 * 60 * 24 * 365.25)) * 100) / 100;
}

export function formatDate(date: Date | string): string {
  return new Date(date).toISOString().split("T")[0];
}

// ── String helpers ─────────────────────────────────────────────────
export function generateEmployeeCode(sequence: number): string {
  return `EMP${String(sequence).padStart(6, "0")}`;
}

// ── Pagination ─────────────────────────────────────────────────────
export function getPaginationParams(query: {
  page?: string;
  limit?: string;
}): { skip: number; take: number; page: number; limit: number } {
  const page = Math.max(1, parseInt(query.page ?? "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? "20", 10)));
  return { skip: (page - 1) * limit, take: limit, page, limit };
}

export function buildPaginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  limit: number
) {
  return { items, total, page, limit, pages: Math.ceil(total / limit) };
}
