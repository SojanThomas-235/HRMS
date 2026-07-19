"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, usePathname } from "next/navigation";
import api from "@/lib/axios";
import type { AuthUser } from "@hrms/types";

interface MeResponse {
  id: string;
  email: string;
  role: string;
  employeeId: string | null;
  employee: {
    fullName: string;
    employeeCode: string;
    department: { name: string };
    designation: { title: string };
  } | null;
}

export function useAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();

  // Don't call /auth/me on public pages — prevents auth loop
  const isPublicPage = pathname.startsWith("/login");

  const { data: user, isLoading } = useQuery<MeResponse>({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: MeResponse }>("/auth/me");
      return res.data.data;
    },
    enabled: !isPublicPage,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 min
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const res = await api.post<{ success: boolean; data: AuthUser }>(
        "/auth/login",
        credentials
      );
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      router.push("/dashboard");
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await api.post("/auth/logout");
    },
    onSuccess: () => {
      queryClient.clear();
      router.push("/login");
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    loginPending: loginMutation.isPending,
    loginError: loginMutation.error,
    logout: logoutMutation.mutate,
    logoutPending: logoutMutation.isPending,
  };
}
