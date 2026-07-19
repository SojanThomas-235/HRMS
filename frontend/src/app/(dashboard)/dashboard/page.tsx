"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardStats } from "@/hooks/useDashboard";
import { Card, CardHeader, CardTitle, Badge, SkeletonCard } from "@/components/ui";
import {
  Users, TrendingUp, UserCheck, UserMinus,
  CalendarPlus, Award, Star, BarChart3,
  ArrowRight, Zap,
} from "lucide-react";

// ── Tiny bar component for department breakdown ─────────────────────────────
function DeptBar({ label, count, max }: { label: string; count: number; max: number }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 shrink-0 text-xs text-gray-500 dark:text-slate-400 truncate">{label}</span>
      <div className="flex-1 h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-2 rounded-full bg-blue-500 dark:bg-blue-400 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-6 text-xs font-medium text-gray-700 dark:text-slate-300 text-right">{count}</span>
    </div>
  );
}

// ── BPV colour helper ───────────────────────────────────────────────────────
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

// ── KPI Card ────────────────────────────────────────────────────────────────
function KpiCard({
  icon: Icon, label, value, sub, color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 flex items-center gap-4">
      <div className={`${color} rounded-xl p-2.5 shrink-0`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-gray-500 dark:text-slate-400">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading } = useDashboardStats();

  const maxDept = data?.departmentData[0]?.count ?? 1;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back{user?.employee?.fullName ? `, ${user.employee.fullName.split(" ")[0]}` : ""}
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
            Here&apos;s your organisation at a glance.
          </p>
        </div>
        <Link
          href="/employees"
          className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
        >
          View all employees <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* KPI Row */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          <KpiCard icon={Users}      label="Total Employees" value={data?.headcount.total ?? 0}       color="bg-blue-500"    />
          <KpiCard icon={UserCheck}  label="Active"          value={data?.headcount.active ?? 0}      color="bg-emerald-500" />
          <KpiCard icon={UserMinus}  label="On Notice"       value={data?.headcount.onNotice ?? 0}    color="bg-amber-500"   />
          <KpiCard icon={CalendarPlus} label="Joined (30d)"  value={data?.headcount.recentJoins ?? 0} color="bg-purple-500"  />
          <KpiCard
            icon={TrendingUp}
            label="Avg BPV Score"
            value={`${data?.avgBpv ?? 0}`}
            sub="Best Performance Value"
            color="bg-indigo-500"
          />
        </div>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* BPV Distribution */}
        <Card padding="none">
          <CardHeader className="p-5 pb-0">
            <CardTitle icon={<BarChart3 className="w-4 h-4" />}>BPV Distribution</CardTitle>
          </CardHeader>
          <div className="p-5 space-y-4">
            {isLoading ? (
              <div className="h-32 animate-pulse bg-gray-100 dark:bg-slate-700 rounded-lg" />
            ) : (
              <>
                {/* Visual stacked bar */}
                <div className="flex h-6 rounded-full overflow-hidden gap-0.5">
                  {(data?.bpvDistribution.green ?? 0) > 0 && (
                    <div
                      className="bg-emerald-500 dark:bg-emerald-400 transition-all"
                      style={{ flex: data?.bpvDistribution.green }}
                      title={`High performers: ${data?.bpvDistribution.green}`}
                    />
                  )}
                  {(data?.bpvDistribution.amber ?? 0) > 0 && (
                    <div
                      className="bg-amber-400 dark:bg-amber-500 transition-all"
                      style={{ flex: data?.bpvDistribution.amber }}
                      title={`Developing: ${data?.bpvDistribution.amber}`}
                    />
                  )}
                  {(data?.bpvDistribution.red ?? 0) > 0 && (
                    <div
                      className="bg-red-400 dark:bg-red-500 transition-all"
                      style={{ flex: data?.bpvDistribution.red }}
                      title={`Needs focus: ${data?.bpvDistribution.red}`}
                    />
                  )}
                  {(!data || (data.bpvDistribution.green + data.bpvDistribution.amber + data.bpvDistribution.red) === 0) && (
                    <div className="flex-1 bg-gray-200 dark:bg-slate-700 rounded-full" />
                  )}
                </div>
                {/* Legend */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{data?.bpvDistribution.green ?? 0}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">High (≥70)</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{data?.bpvDistribution.amber ?? 0}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">Developing</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-red-600 dark:text-red-400">{data?.bpvDistribution.red ?? 0}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">Needs Focus</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Department Breakdown */}
        <Card padding="none">
          <CardHeader className="p-5 pb-0">
            <CardTitle icon={<Users className="w-4 h-4" />}>By Department</CardTitle>
          </CardHeader>
          <div className="p-5 space-y-3">
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-4 bg-gray-100 dark:bg-slate-700 rounded animate-pulse" />
                ))}
              </div>
            ) : data?.departmentData.length ? (
              data.departmentData.map((d) => (
                <DeptBar key={d.department} label={d.department} count={d.count} max={maxDept} />
              ))
            ) : (
              <p className="text-sm text-gray-400 dark:text-slate-500">No data yet</p>
            )}
          </div>
        </Card>

        {/* Recent BPV Events */}
        <Card padding="none">
          <CardHeader className="p-5 pb-0">
            <CardTitle icon={<Zap className="w-4 h-4" />}>Recent BPV Calculations</CardTitle>
          </CardHeader>
          <div className="p-5 space-y-3">
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-10 bg-gray-100 dark:bg-slate-700 rounded animate-pulse" />
                ))}
              </div>
            ) : data?.recentBpvEvents.length ? (
              data.recentBpvEvents.map((evt, i) => (
                <div key={i} className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-slate-200 truncate">{evt.employeeName}</p>
                    <p className="text-xs text-gray-400 dark:text-slate-500">{evt.employeeCode}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-sm font-bold ${bpvColor(evt.totalScore)}`}>{evt.totalScore}</span>
                    <p className="text-xs text-gray-400 dark:text-slate-500">
                      {new Date(evt.calculatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 dark:text-slate-500">No BPV calculations yet</p>
            )}
          </div>
        </Card>
      </div>

      {/* Top Performers Table */}
      <Card padding="none">
        <CardHeader className="p-5 pb-0">
          <CardTitle icon={<Award className="w-4 h-4" />}>Top Performers</CardTitle>
        </CardHeader>
        <div className="p-5">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 bg-gray-100 dark:bg-slate-700 rounded animate-pulse" />
              ))}
            </div>
          ) : data?.topPerformers.length ? (
            <div className="overflow-x-auto -mx-5 px-5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-medium text-gray-500 dark:text-slate-400 border-b border-gray-100 dark:border-slate-700">
                    <th className="pb-3 pr-4">#</th>
                    <th className="pb-3 pr-4">Employee</th>
                    <th className="pb-3 pr-4">Department</th>
                    <th className="pb-3 pr-4">Designation</th>
                    <th className="pb-3 text-right">BPV Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                  {data.topPerformers.map((emp, i) => (
                    <tr key={emp.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="py-3 pr-4 text-gray-400 dark:text-slate-500 font-mono">{i + 1}</td>
                      <td className="py-3 pr-4">
                        <Link href={`/employees/${emp.id}`} className="hover:underline">
                          <p className="font-medium text-gray-900 dark:text-white">{emp.fullName}</p>
                          <p className="text-xs text-gray-400 dark:text-slate-500">{emp.employeeCode}</p>
                        </Link>
                      </td>
                      <td className="py-3 pr-4 text-gray-600 dark:text-slate-300">{emp.deptName}</td>
                      <td className="py-3 pr-4 text-gray-600 dark:text-slate-300">{emp.desigTitle}</td>
                      <td className="py-3 text-right">
                        <Badge variant={bpvBadge(emp.totalScore)}>
                          <Star className="w-3 h-3" />
                          {emp.totalScore}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-400 dark:text-slate-500 py-4 text-center">
              Run a BPV calculation to see top performers here.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
