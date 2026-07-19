import { useAuth } from "@/hooks/useAuth";
import { can, type Action, type UserRole } from "@/lib/permissions";

/**
 * Returns a `can(action)` checker bound to the currently logged-in user's role.
 *
 * Usage:
 *   const { can, role, employeeId } = usePermissions();
 *   if (can("employee:create")) { ... }
 */
export function usePermissions() {
  const { user } = useAuth();
  const role = user?.role as UserRole | undefined;
  const employeeId = user?.employeeId ?? null;

  return {
    role,
    employeeId,
    /** Check if the current user can perform the given action. */
    can: (action: Action) => can(role, action),
    /**
     * True if the current user is viewing/editing their own employee record.
     * Pass the employee id from the URL to compare.
     */
    isSelf: (id: string) => employeeId === id,
  };
}
