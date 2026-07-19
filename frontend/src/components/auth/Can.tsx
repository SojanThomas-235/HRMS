"use client";

import { usePermissions } from "@/hooks/usePermissions";
import type { Action } from "@/lib/permissions";

interface CanProps {
  /** The permission action to check */
  perform: Action;
  /** Rendered when the user HAS the permission */
  children: React.ReactNode;
  /** Optional fallback rendered when the user LACKS the permission */
  fallback?: React.ReactNode;
}

/**
 * Conditionally renders children based on the current user's permissions.
 *
 * Usage:
 *   <Can perform="employee:create">
 *     <Button>Add Employee</Button>
 *   </Can>
 *
 *   <Can perform="employee:edit" fallback={<span>Read-only</span>}>
 *     <EditButton />
 *   </Can>
 */
export function Can({ perform, children, fallback = null }: CanProps) {
  const { can } = usePermissions();
  return can(perform) ? <>{children}</> : <>{fallback}</>;
}
