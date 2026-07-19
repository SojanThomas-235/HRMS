"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export interface DashboardStats {
  headcount: {
    total:      number;
    active:     number;
    onNotice:   number;
    exited:     number;
    recentJoins: number;
  };
  avgBpv: number;
  bpvDistribution: { green: number; amber: number; red: number };
  departmentData: { department: string; count: number }[];
  topPerformers: {
    id: string; fullName: string; employeeCode: string;
    totalScore: number; deptName: string; desigTitle: string;
  }[];
  recentBpvEvents: {
    employeeName: string; employeeCode: string;
    totalScore: number; calculatedAt: string;
  }[];
}

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ["dashboard", "stats"],
    queryFn: () =>
      api.get<{ data: DashboardStats }>("/dashboard/stats").then((r) => r.data.data),
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });
}
