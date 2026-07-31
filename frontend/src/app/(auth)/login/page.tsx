"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Users, TrendingUp, Shield } from "lucide-react";
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
    <div className="min-h-screen flex dark:bg-slate-900 transition-colors duration-300">

      {/* ── Left brand panel ─────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] bg-gradient-to-br from-[#2C3E50] via-[#1a2e3d] to-[#0d1f2d] relative overflow-hidden flex-col items-start justify-between p-12">
        {/* Background decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#27B1AE]/10 blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-[#136F9A]/15 blur-3xl translate-y-1/2 -translate-x-1/4" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#27B1AE] to-[#136F9A] flex items-center justify-center shadow-lg shadow-[#27B1AE]/30">
            <span className="text-white text-sm font-bold tracking-tight">HR</span>
          </div>
          <div>
            <span className="text-white text-lg font-bold tracking-tight">HRMS</span>
            <p className="text-white/40 text-[10px]">Human Resources</p>
          </div>
        </div>

        {/* Headline */}
        <div className="relative z-10">
          <h2 className="text-4xl font-bold text-white leading-tight max-w-sm">
            Manage your workforce<br />
            <span className="text-[#4fc4c1]">smarter & faster.</span>
          </h2>
          <p className="text-white/50 text-sm mt-4 max-w-xs leading-relaxed">
            A complete HRMS built for modern teams — from onboarding to performance tracking.
          </p>

          {/* Feature chips */}
          <div className="mt-8 flex flex-col gap-3">
            {[
              { icon: Users, text: "Centralized employee records & profiles" },
              { icon: TrendingUp, text: "BPV performance scoring & analytics" },
              { icon: Shield, text: "Role-based access control & compliance" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-white/[0.08] border border-white/10 flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5 text-[#4fc4c1]" />
                </div>
                <span className="text-sm text-white/60">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="relative z-10 text-xs text-white/25">© 2026 HRMS. All rights reserved.</p>
      </div>

      {/* ── Right form panel ────────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[#F8FBFD] dark:bg-slate-900">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#27B1AE] to-[#136F9A] flex items-center justify-center shadow-lg shadow-[#27B1AE]/30">
              <span className="text-white text-lg font-bold">HR</span>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Sign in to your HRMS account</p>
          </div>

          {/* Form card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-[#dde8f0] dark:border-slate-700 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] p-7">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register("email")}
                  className={cn(
                    "block w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500",
                    "bg-white dark:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-[#27B1AE] focus:border-transparent",
                    "transition duration-150",
                    errors.email
                      ? "border-red-400 bg-red-50 dark:border-red-500/50 dark:bg-red-900/20"
                      : "border-[#dde8f0] dark:border-slate-600"
                  )}
                  placeholder="you@company.com"
                />
                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    {...register("password")}
                    className={cn(
                      "block w-full rounded-xl border px-3.5 py-2.5 pr-10 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500",
                      "bg-white dark:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-[#27B1AE] focus:border-transparent",
                      "transition duration-150",
                      errors.password
                        ? "border-red-400 bg-red-50 dark:border-red-500/50 dark:bg-red-900/20"
                        : "border-[#dde8f0] dark:border-slate-600"
                    )}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                  "w-full flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 mt-2",
                  "bg-gradient-to-r from-[#27B1AE] to-[#136F9A] text-white text-sm font-semibold",
                  "hover:from-[#1e9e9b] hover:to-[#0e5a7d] active:from-[#167b79]",
                  "focus:outline-none focus:ring-2 focus:ring-[#27B1AE] focus:ring-offset-2 dark:focus:ring-offset-slate-800",
                  "shadow-md shadow-[#27B1AE]/25 hover:shadow-lg hover:shadow-[#27B1AE]/30",
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
    </div>
  );
}
