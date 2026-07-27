"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { loginSchema } from "@hrms/validators";
import type { z } from "zod";
import { cn } from "@/lib/utils";

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { loginAsync, loginPending } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      await loginAsync(data);
      toast.success("Welcome back!");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? "Login failed. Please try again.";
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 px-4 transition-colors duration-300">
      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#f9701a] shadow-lg shadow-[#f9701a]/30 mb-4">
            <span className="text-white text-xl font-bold tracking-tight">HR</span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Sign in to HRMS</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Enter your credentials to continue</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-gray-200/60 dark:shadow-slate-900/60 border border-gray-200 dark:border-slate-700 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register("email")}
                className={cn(
                  "block w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500",
                  "focus:outline-none focus:ring-2 focus:ring-[#f9701a] focus:border-transparent",
                  "transition duration-150",
                  errors.email
                    ? "border-red-400 bg-red-50 dark:border-red-500/50 dark:bg-red-900/20"
                    : "border-gray-300 bg-white dark:border-slate-600 dark:bg-slate-700/50"
                )}
                placeholder="you@company.com"
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  {...register("password")}
                  className={cn(
                    "block w-full rounded-lg border px-3.5 py-2.5 pr-10 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500",
                    "focus:outline-none focus:ring-2 focus:ring-[#f9701a] focus:border-transparent",
                    "transition duration-150",
                    errors.password
                      ? "border-red-400 bg-red-50 dark:border-red-500/50 dark:bg-red-900/20"
                      : "border-gray-300 bg-white dark:border-slate-600 dark:bg-slate-700/50"
                  )}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loginPending}
              className={cn(
                "w-full flex items-center justify-center gap-2 rounded-lg px-4 py-2.5",
                "bg-[#f9701a] text-white text-sm font-medium",
                "hover:bg-[#c2440e] active:bg-[#9a3714]",
                "focus:outline-none focus:ring-2 focus:ring-[#f9701a] focus:ring-offset-2 dark:focus:ring-offset-slate-800",
                "shadow-md shadow-[#f9701a]/25 hover:shadow-lg hover:shadow-[#f9701a]/30",
                "disabled:opacity-60 disabled:cursor-not-allowed",
                "transition-all duration-150"
              )}
            >
              {loginPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {loginPending ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-slate-500 mt-6">
          Contact your HR administrator if you need access.
        </p>
      </div>
    </div>
  );
}
