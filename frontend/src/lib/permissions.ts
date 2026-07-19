/**
 * Role-Based Drive — Permission Matrix
 *
 * Every action in the system is a string key.
 * Each role maps to the set of actions it is allowed to perform.
 */

export type UserRole =
  | "EMPLOYEE"
  | "MANAGER"
  | "HR_ADMIN"
  | "FINANCE_ADMIN"
  | "SYSTEM_ADMIN";

// ── Action keys ────────────────────────────────────────────────────────────────

export type Action =
  // Employee CRUD
  | "employee:list"
  | "employee:list:team"     // MANAGER — only direct reports
  | "employee:view"
  | "employee:view:own"      // EMPLOYEE — own profile only
  | "employee:create"
  | "employee:edit"
  | "employee:delete"
  // Sub-resources (qualifications, experience, skills, certifications)
  | "employee:sub:manage"    // HR_ADMIN / SYSTEM_ADMIN
  | "employee:sub:self"      // EMPLOYEE managing own sub-resources
  // Navigation sections
  | "nav:employees"
  | "nav:tasks"
  | "nav:time"
  | "nav:efficiency"
  | "nav:assets"
  | "nav:rewards"
  | "nav:beneficiaries"
  | "nav:config";

// ── Permission map ─────────────────────────────────────────────────────────────

const ROLE_PERMISSIONS: Record<UserRole, Set<Action>> = {
  EMPLOYEE: new Set([
    "employee:view:own",
    "employee:sub:self",
  ]),

  MANAGER: new Set([
    "employee:list:team",
    "employee:view",
    "nav:employees",
    "nav:tasks",
    "nav:time",
  ]),

  HR_ADMIN: new Set([
    "employee:list",
    "employee:view",
    "employee:create",
    "employee:edit",
    "employee:delete",
    "employee:sub:manage",
    "nav:employees",
    "nav:tasks",
    "nav:time",
    "nav:efficiency",
    "nav:assets",
    "nav:rewards",
    "nav:beneficiaries",
    "nav:config",
  ]),

  FINANCE_ADMIN: new Set([
    "employee:list",
    "employee:view",
    "nav:employees",
    "nav:rewards",
    "nav:beneficiaries",
    "nav:config",
  ]),

  SYSTEM_ADMIN: new Set([
    "employee:list",
    "employee:view",
    "employee:create",
    "employee:edit",
    "employee:delete",
    "employee:sub:manage",
    "nav:employees",
    "nav:tasks",
    "nav:time",
    "nav:efficiency",
    "nav:assets",
    "nav:rewards",
    "nav:beneficiaries",
    "nav:config",
  ]),
};

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Returns true if the given role is allowed to perform the action.
 */
export function can(role: UserRole | undefined | null, action: Action): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.has(action) ?? false;
}

/**
 * Returns the full set of actions allowed for a role.
 */
export function permissionsFor(role: UserRole): Set<Action> {
  return ROLE_PERMISSIONS[role] ?? new Set();
}

/**
 * Role display label — used in UI badges.
 */
export const ROLE_LABELS: Record<UserRole, string> = {
  EMPLOYEE:      "Employee",
  MANAGER:       "Manager",
  HR_ADMIN:      "HR Admin",
  FINANCE_ADMIN: "Finance Admin",
  SYSTEM_ADMIN:  "System Admin",
};

/**
 * Role badge colours — maps to Tailwind classes.
 */
export const ROLE_COLORS: Record<UserRole, { bg: string; text: string }> = {
  EMPLOYEE:      { bg: "bg-gray-100 dark:bg-slate-700",    text: "text-gray-600 dark:text-slate-300" },
  MANAGER:       { bg: "bg-blue-100 dark:bg-blue-900/40",  text: "text-blue-700 dark:text-blue-300" },
  HR_ADMIN:      { bg: "bg-violet-100 dark:bg-violet-900/40", text: "text-violet-700 dark:text-violet-300" },
  FINANCE_ADMIN: { bg: "bg-amber-100 dark:bg-amber-900/40", text: "text-amber-700 dark:text-amber-300" },
  SYSTEM_ADMIN:  { bg: "bg-red-100 dark:bg-red-900/40",    text: "text-red-700 dark:text-red-300" },
};
