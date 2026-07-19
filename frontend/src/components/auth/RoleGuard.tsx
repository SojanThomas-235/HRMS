"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePermissions } from "@/hooks/usePermissions";
import { useAuth } from "@/hooks/useAuth";
import type { Action } from "@/lib/permissions";

interface RoleGuardProps {
  /** The action required to access this page */
  require: Action;
  /** Where to redirect if the user lacks access (default: "/dashboard") */
  redirectTo?: string;
  children: React.ReactNode;
}

/**
 * Page-level guard — redirects away if the current user cannot perform `require`.
 *
 * Usage (in a page component):
 *   return (
 *     <RoleGuard require="employee:create">
 *       <NewEmployeePage />
 *     </RoleGuard>
 *   );
 */
export function RoleGuard({ require, redirectTo = "/dashboard", children }: RoleGuardProps) {
  const { isLoading } = useAuth();
  const { can } = usePermissions();
  const router = useRouter();

  const allowed = can(require);

  useEffect(() => {
    if (!isLoading && !allowed) {
      router.replace(redirectTo);
    }
  }, [isLoading, allowed, router, redirectTo]);

  // While loading auth, render nothing to avoid flash
  if (isLoading) return null;
  if (!allowed) return null;

  return <>{children}</>;
}
