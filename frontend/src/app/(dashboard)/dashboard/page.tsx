"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardStats } from "@/hooks/useDashboard";
import { Card, CardHeader, CardTitle, Badge, SkeletonCard } from "@/components/ui";
import {
  Users, TrendingUp, UserCheck, UserMinus,
  CalendarPlus, Award, Star, BarChart3,
  ArrowRight, Zap, ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Helpers ────────────────────────────────────────────────────────────────────

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

function bpvColor(score: number) {
  if (score >= 70) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 40) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

function bpvBadge(score: number): "success" | "warning" | "danger" {
  if (score >= 70) return "success";
  if (score >= 40) return "warning";
  return "danger";
}

// ── Stat Card — DreamsERP style ───────────────────────────────────────────────

function StatCard({
  icon: Icon, label, value, sub, iconBg, href, trendPct,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  iconBg: string;
  href?: string;
  trendPct?: number;
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-[#dde8f0] dark:border-slate-700/60 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] flex flex-col gap-4 relative overflow-hidden group">
      {/* Subtle decorative circle */}
      <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-gray-50/80 dark:bg-white/[0.03] transition-transform duration-300 group-hover:scale-125" />

      {/* Top row: trend badge + icon */}
      <div className="flex items-start justify-between relative z-10">
        {trendPct != null ? (
          <span className={cn(
            "inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full",
            trendPct >= 0
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
              : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          )}>
            {trendPct >= 0 ? "↑" : "↓"} {Math.abs(trendPct)}%
          </span>
        ) : <span />}
        <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm", iconBg)}>
          <Icon className="w-[22px] h-[22px] text-white" />
        </div>
      </div>

      {/* Value + label */}
      <div className="relative z-10">
        <p className="text-3xl font-bold text-gray-900 dark:text-white tabular-nums leading-none">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1.5 font-medium">{label}</p>
        {sub && <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{sub}</p>}
        {href && (
          <Link href={href} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#27B1AE] hover:text-[#136F9A] transition-colors">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>
    </div>
  );
}

// ── Dept bar ───────────────────────────────────────────────────────────────────

function DeptBar({ label, count, max }: { label: string; count: number; max: number }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 shrink-0 text-xs text-gray-500 dark:text-slate-400 truncate">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-1.5 rounded-full bg-[#27B1AE] dark:bg-[#4fc4c1] transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-7 text-xs font-semibold text-gray-700 dark:text-slate-300 text-right tabular-nums">{count}</span>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading } = useDashboardStats();

  const firstName = user?.employee?.fullName?.split(" ")[0] ?? "";
  const maxDept   = data?.departmentData[0]?.count ?? 1;

  return (
    <div className="flex flex-col gap-6">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[#27B1AE] dark:text-[#4fc4c1] text-sm font-semibold tracking-wide">
            {getGreeting()} 👋
          </p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5 leading-tight">
            {firstName ? `Welcome back, ${firstName}` : "Welcome back"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
            Here&apos;s what&apos;s happening with your workforce today.
          </p>
        </div>
        <Link
          href="/employees/new"
          className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl bg-gradient-to-r from-[#27B1AE] to-[#136F9A] text-white shadow-sm shadow-[#27B1AE]/25 hover:shadow-md hover:from-[#1e9e9b] hover:to-[#0e5a7d] transition-all duration-150 shrink-0"
        >
          <ArrowUpRight className="w-4 h-4" />
          Add Employee
        </Link>
      </div>

      {/* ── KPI Stat Cards — white cards floating on dark bg ──────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl backdrop-saturate-150 rounded-2xl p-5 shadow-lg h-32 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
          <StatCard
            icon={Users}
            label="Total Employees"
            value={data?.headcount.total ?? 0}
            iconBg="bg-gradient-to-br from-[#27B1AE] to-[#136F9A]"
            href="/employees"
            trendPct={3.6}
          />
          <StatCard
            icon={UserCheck}
            label="Active"
            value={data?.headcount.active ?? 0}
            iconBg="bg-gradient-to-br from-emerald-400 to-emerald-600"
            trendPct={2.1}
          />
          <StatCard
            icon={UserMinus}
            label="On Notice"
            value={data?.headcount.onNotice ?? 0}
            iconBg="bg-gradient-to-br from-amber-400 to-orange-500"
          />
          <StatCard
            icon={CalendarPlus}
            label="Joined (30d)"
            value={data?.headcount.recentJoins ?? 0}
            iconBg="bg-gradient-to-br from-violet-400 to-purple-600"
            trendPct={1.4}
          />
          <StatCard
            icon={TrendingUp}
            label="Avg BPV Score"
            value={data?.avgBpv != null ? Number(data.avgBpv).toFixed(1) : "—"}
            sub="Best Performance Value"
            iconBg="bg-gradient-to-br from-[#136F9A] to-[#2C3E50]"
          />
        </div>
      )}

      {/* ── Content Grid — on the light section ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* BPV Distribution */}
        <Card padding="none">
          <CardHeader className="px-5 pt-5 pb-0">
            <CardTitle icon={<BarChart3 className="w-4 h-4" />}>BPV Distribution</CardTitle>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-700/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </CardHeader>
          <div className="px-5 pb-5 pt-4 space-y-5">
            {isLoading ? (
              <div className="h-28 animate-pulse bg-gray-100 dark:bg-slate-700 rounded-xl" />
            ) : (
              <>
                {/* Stacked bar */}
                <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
                  {(data?.bpvDistribution.green ?? 0) > 0 && (
                    <div className="bg-emerald-500 rounded-l-full transition-all"
                      style={{ flex: data?.bpvDistribution.green }}
                      title={`High: ${data?.bpvDistribution.green}`} />
                  )}
                  {(data?.bpvDistribution.amber ?? 0) > 0 && (
                    <div className="bg-amber-400 transition-all"
                      style={{ flex: data?.bpvDistribution.amber }}
                      title={`Developing: ${data?.bpvDistribution.amber}`} />
                  )}
                  {(data?.bpvDistribution.red ?? 0) > 0 && (
                    <div className="bg-red-400 rounded-r-full transition-all"
                      style={{ flex: data?.bpvDistribution.red }}
                      title={`Focus: ${data?.bpvDistribution.red}`} />
                  )}
                  {(!data || (data.bpvDistribution.green + data.bpvDistribution.amber + data.bpvDistribution.red) === 0) && (
                    <div className="flex-1 bg-gray-200 dark:bg-slate-700 rounded-full" />
                  )}
                </div>
                {/* Legend */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    { color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20", val: data?.bpvDistribution.green ?? 0, label: "High (≥70)" },
                    { color: "text-amber-600 dark:text-amber-400",   bg: "bg-amber-50 dark:bg-amber-900/20",   val: data?.bpvDistribution.amber ?? 0, label: "Developing" },
                    { color: "text-red-600 dark:text-red-400",       bg: "bg-red-50 dark:bg-red-900/20",       val: data?.bpvDistribution.red ?? 0,   label: "Focus" },
                  ].map(({ color, bg, val, label }) => (
                    <div key={label} className={cn("rounded-xl p-3", bg)}>
                      <p className={cn("text-2xl font-bold", color)}>{val}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </Card>

        {/* By Department */}
        <Card padding="none">
          <CardHeader className="px-5 pt-5 pb-0">
            <CardTitle icon={<Users className="w-4 h-4" />}>By Department</CardTitle>
            <Link href="/employees" className="text-xs font-semibold text-[#27B1AE] hover:text-[#136F9A] transition-colors flex items-center gap-0.5">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <div className="px-5 pb-5 pt-4 space-y-3">
            {isLoading ? (
              <div className="space-y-2.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-4 bg-gray-100 dark:bg-slate-700 rounded animate-pulse" />
                ))}
              </div>
            ) : data?.departmentData.length ? (
              data.departmentData.map((d) => (
                <DeptBar key={d.department} label={d.department} count={d.count} max={maxDept} />
              ))
            ) : (
              <p className="text-sm text-gray-400 dark:text-slate-500 py-4 text-center">No data yet</p>
            )}
          </div>
        </Card>

        {/* Recent BPV Events */}
        <Card padding="none">
          <CardHeader className="px-5 pt-5 pb-0">
            <CardTitle icon={<Zap className="w-4 h-4" />}>Recent BPV Calculations</CardTitle>
          </CardHeader>
          <div className="px-5 pb-5 pt-4 space-y-3">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-10 bg-gray-100 dark:bg-slate-700 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : data?.recentBpvEvents.length ? (
              data.recentBpvEvents.map((evt, i) => (
                <div key={i} className="flex items-center justify-between gap-3 py-1">
                  {/* Avatar initial */}
                  <div className="w-8 h-8 rounded-full bg-[#e8f7f7] dark:bg-[#27B1AE]/30 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-[#27B1AE] dark:text-[#4fc4c1]">
                      {evt.employeeName.charAt(0)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-800 dark:text-slate-200 truncate">{evt.employeeName}</p>
                    <p className="text-xs text-gray-400 dark:text-slate-500">
                      {new Date(evt.calculatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                  <span className={cn("text-sm font-bold tabular-nums shrink-0", bpvColor(evt.totalScore))}>
                    {evt.totalScore}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 dark:text-slate-500 py-4 text-center">No BPV calculations yet</p>
            )}
          </div>
        </Card>
      </div>

      {/* ── Top Performers ─────────────────────────────────────────────────── */}
      <Card padding="none">
        <CardHeader className="px-5 pt-5 pb-0">
          <div className="flex items-center justify-between gap-3">
            <CardTitle icon={<Award className="w-4 h-4" />}>Top Performers</CardTitle>
            <Link
              href="/employees"
              className="text-xs text-[#136F9A] dark:text-[#4fc4c1] hover:underline font-medium flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </CardHeader>
        <div className="px-5 pb-5 pt-4">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 bg-gray-100 dark:bg-slate-700 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : data?.topPerformers.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-slate-700/60">
                    <th className="pb-3 pr-4 text-left text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide">#</th>
                    <th className="pb-3 pr-4 text-left text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide">Employee</th>
                    <th className="pb-3 pr-4 text-left text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide hidden md:table-cell">Department</th>
                    <th className="pb-3 pr-4 text-left text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide hidden lg:table-cell">Designation</th>
                    <th className="pb-3 text-right text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide">BPV</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                  {data.topPerformers.map((emp, i) => (
                    <tr key={emp.id} className="hover:bg-gray-50/70 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="py-3.5 pr-4">
                        <span className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                          i === 0 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          : i === 1 ? "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                          : i === 2 ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                          : "text-gray-400 dark:text-slate-500",
                        )}>
                          {i + 1}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4">
                        <Link href={`/employees/${emp.id}`} className="hover:underline underline-offset-2 group">
                          <p className="font-semibold text-sage-600 dark:text-white group-hover:text-[#136F9A] dark:group-hover:text-[#4fc4c1] transition-colors">
                            {emp.fullName}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-slate-500 font-mono mt-0.5">{emp.employeeCode}</p>
                        </Link>
                      </td>
                      <td className="py-3.5 pr-4 text-gray-600 dark:text-slate-300 hidden md:table-cell">{emp.deptName}</td>
                      <td className="py-3.5 pr-4 text-gray-500 dark:text-slate-400 text-xs hidden lg:table-cell">{emp.desigTitle}</td>
                      <td className="py-3.5 text-right">
                        <Badge variant={bpvBadge(emp.totalScore)}>
                          <Star className="w-3 h-3 mr-0.5" />
                          {emp.totalScore}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-400 dark:text-slate-500 py-6 text-center">
              Run a BPV calculation to see top performers here.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
