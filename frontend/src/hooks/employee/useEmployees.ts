"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/axios";
import type { PaginatedResponse } from "@hrms/types";

export interface EmployeeListItem {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string;
  phone?: string;
  status: "ACTIVE" | "ON_NOTICE" | "EXITED";
  dateOfJoining: string;
  latestBpvScore: number | null;
  department:  { id: string; name: string };
  designation: { id: string; title: string; grade?: string };
  manager?:    { id: string; fullName: string } | null;
}

export interface EmployeeFilters {
  page?: number;
  limit?: number;
  search?: string;
  departmentId?: string;
  status?: string;
  /** "team" → backend filters to caller's direct reports (MANAGER scope) */
  scope?: "team";
}

export function useEmployees(filters: EmployeeFilters = {}) {
  return useQuery<PaginatedResponse<EmployeeListItem>>({
    queryKey: ["employees", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.page)         params.set("page",         String(filters.page));
      if (filters.limit)        params.set("limit",        String(filters.limit));
      if (filters.search)       params.set("search",       filters.search);
      if (filters.departmentId) params.set("departmentId", filters.departmentId);
      if (filters.status)       params.set("status",       filters.status);
      if (filters.scope)        params.set("scope",        filters.scope);
      const res = await api.get<{ data: PaginatedResponse<EmployeeListItem> }>(
        `/employees?${params}`
      );
      return res.data.data;
    },
    staleTime: 30_000,
  });
}

export function useDeleteEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/employees/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee deleted successfully");
    },
    onError: () => toast.error("Failed to delete employee"),
  });
}
