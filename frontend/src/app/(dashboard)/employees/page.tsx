"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  UserPlus, Search, Filter, X, Users, SlidersHorizontal,
  ArrowRight, Pencil, Trash2, Mail, Phone,
  Calendar, Building2, Briefcase, TrendingUp, UserCircle,
} from "lucide-react";
import {
  Button, Badge, Breadcrumb, Pagination,
  Avatar, EmptyState, SkeletonTable, Modal, SidePanel, Tooltip, BackButton,
} from "@/components/ui";
import { Can } from "@/components/auth";
import { useEmployees, useDeleteEmployee, type EmployeeListItem } from "@/hooks/employee/useEmployees";
import { useDepartments } from "@/hooks/useMasters";
import { usePermissions } from "@/hooks/usePermissions";
import { cn } from "@/lib/utils";

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "ACTIVE",    label: "Active" },
  { value: "ON_NOTICE", label: "On Notice" },
  { value: "EXITED",    label: "Exited" },
];

const statusVariant = (s: string) =>
  s === "ACTIVE" ? "success" : s === "ON_NOTICE" ? "warning" : "danger";

const statusLabel = (s: string) =>
  s === "ON_NOTICE" ? "On Notice" : s.charAt(0) + s.slice(1).toLowerCase();

// ── BPV ring gauge ────────────────────────────────────────────────────────────

function BpvRing({ score }: { score: number }) {
  const radius  = 38;
  const stroke  = 7;
  const circ    = 2 * Math.PI * radius;
  const pct     = Math.min(100, Math.max(0, score)) / 100;
  const color   = score >= 70 ? "#10b981" : score >= 40 ? "#f59e0b" : "#ef4444";
  const label   = score >= 70 ? "High" : score >= 40 ? "Developing" : "Focus";

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={100} height={100} viewBox="0 0 100 100">
        {/* Track */}
        <circle
          cx="50" cy="50" r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-gray-100 dark:text-slate-700"
        />
        {/* Progress */}
        <circle
          cx="50" cy="50" r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct)}
          transform="rotate(-90 50 50)"
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
        {/* Score text */}
        <text
          x="50" y="46"
          textAnchor="middle"
          fontSize="18"
          fontWeight="700"
          fill={color}
        >
          {score.toFixed(1)}
        </text>
        <text
          x="50" y="62"
          textAnchor="middle"
          fontSize="9"
          fill="currentColor"
          className="fill-gray-400 dark:fill-slate-500"
        >
          / 100
        </text>
      </svg>
      <span className="text-xs font-medium" style={{ color }}>{label}</span>
    </div>
  );
}

// ── Info row inside panel ─────────────────────────────────────────────────────

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 p-1.5 rounded-lg bg-gray-100 dark:bg-slate-700 shrink-0">
        <Icon className="w-3.5 h-3.5 text-gray-500 dark:text-slate-400" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-slate-500 mb-0.5">
          {label}
        </p>
        <p className="text-sm font-medium text-gray-800 dark:text-slate-200 break-all">{value}</p>
      </div>
    </div>
  );
}

// ── Action chip button ────────────────────────────────────────────────────────

function ActionChip({
  icon: Icon,
  label,
  tooltip,
  onClick,
  variant = "default",
}: {
  icon: React.ElementType;
  label: string;
  tooltip: string;
  onClick: () => void;
  variant?: "default" | "primary" | "danger";
}) {
  const base = "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 active:scale-95 cursor-pointer border";
  const styles = {
    default: "bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 hover:border-gray-300 dark:hover:border-slate-600 hover:-translate-y-0.5 hover:shadow-sm",
    primary: "bg-primary-600 border-primary-600 text-white hover:bg-primary-700 hover:border-primary-700 hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary-500/20",
    danger:  "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:-translate-y-0.5 hover:shadow-sm",
  };

  return (
    <Tooltip label={tooltip}>
      <button onClick={onClick} className={cn(base, styles[variant])}>
        <Icon className="w-4 h-4 shrink-0" />
        {label}
      </button>
    </Tooltip>
  );
}

// ── Employee preview panel content ────────────────────────────────────────────

function EmployeePreview({
  emp,
  onClose,
  canWrite,
  canDelete,
  onDelete,
}: {
  emp: EmployeeListItem;
  onClose: () => void;
  canWrite: boolean;
  canDelete: boolean;
  onDelete: (emp: EmployeeListItem) => void;
}) {
  const router = useRouter();

  return (
    <>
      <SidePanel.Header onClose={onClose}>Quick Preview</SidePanel.Header>

      <SidePanel.Body>
        {/* ── Profile hero ─────────────────────────────────────────── */}
        <div className="px-6 py-6 flex flex-col items-center text-center border-b border-gray-100 dark:border-slate-700/60 bg-gradient-to-b from-gray-50 dark:from-slate-800/60 to-transparent">
          <Avatar name={emp.fullName} size="xl" />
          <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-white leading-tight">
            {emp.fullName}
          </h2>
          <p className="mt-0.5 font-mono text-xs text-gray-400 dark:text-slate-500 tracking-wider">
            {emp.employeeCode}
          </p>
          <div className="mt-3 flex items-center gap-2 flex-wrap justify-center">
            <Badge variant={statusVariant(emp.status)} dot>{statusLabel(emp.status)}</Badge>
            {emp.designation.grade && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-700">
                Grade {emp.designation.grade}
              </span>
            )}
          </div>
        </div>

        {/* ── BPV Score ─────────────────────────────────────────────── */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-700/60">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-slate-500 mb-4">
            BPV Score
          </p>
          {emp.latestBpvScore != null ? (
            <div className="flex items-center gap-5">
              <BpvRing score={emp.latestBpvScore} />
              <div className="flex-1 space-y-2">
                <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
                  Best Performance Value — a composite score across education, experience, org profile, skills, and certifications.
                </p>
                <div className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold",
                  emp.latestBpvScore >= 70
                    ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                    : emp.latestBpvScore >= 40
                    ? "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400"
                    : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                )}>
                  <TrendingUp className="w-3 h-3" />
                  {emp.latestBpvScore >= 70 ? "Top performer" : emp.latestBpvScore >= 40 ? "In progress" : "Needs attention"}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400 dark:text-slate-500 italic">No BPV score calculated yet</p>
          )}
        </div>

        {/* ── Info ─────────────────────────────────────────────────── */}
        <div className="px-6 py-5 space-y-4 border-b border-gray-100 dark:border-slate-700/60">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-slate-500">
            Details
          </p>
          <InfoRow icon={Building2}  label="Department"  value={emp.department.name} />
          <InfoRow icon={Briefcase}  label="Designation" value={emp.designation.title} />
          <InfoRow icon={Mail}       label="Email"       value={emp.email} />
          {emp.phone && (
            <InfoRow icon={Phone} label="Phone" value={emp.phone} />
          )}
          <InfoRow
            icon={Calendar}
            label="Joined"
            value={new Date(emp.dateOfJoining).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          />
          {emp.manager && (
            <InfoRow icon={UserCircle} label="Reports To" value={emp.manager.fullName} />
          )}
        </div>

        {/* ── Actions ──────────────────────────────────────────────── */}
        <div className="px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-slate-500 mb-4">
            Actions
          </p>
          <div className="flex flex-col gap-2.5">
            <ActionChip
              icon={ArrowRight}
              label="View Full Profile"
              tooltip="Open complete employee record"
              variant="primary"
              onClick={() => router.push(`/employees/${emp.id}`)}
            />
            {canWrite && (
              <ActionChip
                icon={Pencil}
                label="Edit Profile"
                tooltip="Update employee information"
                onClick={() => router.push(`/employees/${emp.id}/edit`)}
              />
            )}
            {canDelete && (
              <ActionChip
                icon={Trash2}
                label="Delete Employee"
                tooltip="Archive and deactivate this employee"
                variant="danger"
                onClick={() => { onClose(); onDelete(emp); }}
              />
            )}
          </div>
        </div>
      </SidePanel.Body>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════

export default function EmployeesPage() {
  const router = useRouter();
  const { can, role, employeeId } = usePermissions();

  useEffect(() => {
    if (role === "EMPLOYEE" && employeeId) {
      router.replace(`/employees/${employeeId}`);
    }
  }, [role, employeeId, router]);

  const [search,       setSearch]       = useState("");
  const [deptId,       setDeptId]       = useState("");
  const [status,       setStatus]       = useState("");
  const [page,         setPage]         = useState(1);
  const [preview,      setPreview]      = useState<EmployeeListItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EmployeeListItem | null>(null);

  // Toolbar UI state
  const [searchHovered, setSearchHovered] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [filterOpen,    setFilterOpen]    = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const searchOpen   = searchHovered || searchFocused || !!search;
  const filterActive = !!deptId || !!status;
  const resetFilters = () => { setDeptId(""); setStatus(""); setPage(1); };

  const scope = role === "MANAGER" ? "team" : undefined;

  const { data, isLoading } = useEmployees({ search, departmentId: deptId, status, page, limit: 15, scope });
  const { data: depts }     = useDepartments();
  const deleteMut           = useDeleteEmployee();

  const clearFilters = useCallback(() => {
    setSearch(""); setDeptId(""); setStatus(""); setPage(1);
  }, []);

  const hasFilters = search || deptId || status;

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteMut.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
  };

  const handleRowClick = (emp: EmployeeListItem) => {
    setPreview((prev) => prev?.id === emp.id ? null : emp);
  };

  const canWrite  = can("employee:create");
  const canDelete = can("employee:delete");

  if (role === "EMPLOYEE") return null;

  return (
    <div className="flex flex-col gap-4">
      {/* ── Breadcrumb row + Back button ── */}
      <div className="flex items-center justify-between">
        <Breadcrumb items={[{ label: role === "MANAGER" ? "My Team" : "Employees" }]} />
        <BackButton href="/dashboard" label="Dashboard" />
      </div>

      {/* ── Title toolbar card ── */}
      {(() => {
        const btnBase = "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 active:scale-95 shrink-0";
        const btnIdle = cn(btnBase, "text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700");
        const btnLit  = cn(btnBase, "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400");
        const btnAdd  = cn(btnBase, "bg-primary-600 hover:bg-primary-700 text-white shadow-sm shadow-primary-600/20");

        const deptFilterOptions = [
          { value: "", label: "All" },
          ...(depts?.map((d) => ({ value: d.id, label: d.name })) ?? []),
        ];
        const statusFilterOptions = [
          { value: "", label: "All" },
          { value: "ACTIVE",    label: "Active" },
          { value: "ON_NOTICE", label: "On Notice" },
          { value: "EXITED",    label: "Exited" },
        ];

        return (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 px-5 pt-4 pb-3.5">
            {/* Title + controls on same line */}
            <div className="flex items-center justify-between gap-4">
              {/* Left: icon + title + desc */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-xl bg-primary-50 dark:bg-primary-900/30 shrink-0">
                  <Users className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-base font-semibold text-gray-900 dark:text-white leading-tight">
                    {role === "MANAGER" ? "My Team" : "Employees"}
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                    {role === "MANAGER" ? "Your direct reports" : "Workforce across all departments"}
                    {data?.total != null && (
                      <span className="ml-1.5 px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 text-[10px] font-semibold tabular-nums">
                        {data.total}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Right: search + filter + add */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Search — hover to expand */}
                <div
                  className="flex items-center gap-2"
                  onMouseEnter={() => setSearchHovered(true)}
                  onMouseLeave={() => setSearchHovered(false)}
                >
                  <div className={cn(
                    "flex items-center overflow-hidden transition-all duration-200",
                    searchOpen ? "w-60 opacity-100" : "w-0 opacity-0 pointer-events-none",
                  )}>
                    <div className="flex items-center gap-1.5 w-full border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 px-3 py-1.5 shadow-sm">
                      <Search className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500 shrink-0" />
                      <input
                        ref={searchInputRef}
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setSearchFocused(false)}
                        placeholder="Search name, code, email…"
                        className="flex-1 text-sm bg-transparent outline-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 min-w-0"
                      />
                      {search && (
                        <button
                          onMouseDown={(e) => { e.preventDefault(); setSearch(""); setPage(1); }}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className={searchOpen ? btnLit : btnIdle}>
                    <Search className="w-4 h-4" />
                  </div>
                </div>

                {/* Filter toggle */}
                <Tooltip label={filterOpen ? "Close filters" : "Filter"}>
                  <button
                    onClick={() => setFilterOpen((v) => !v)}
                    className={cn(filterOpen || filterActive ? btnLit : btnIdle, "relative")}
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    {filterActive && !filterOpen && (
                      <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary-500" />
                    )}
                  </button>
                </Tooltip>

                {/* Add Employee */}
                {canWrite && (
                  <Tooltip label="Add employee">
                    <button onClick={() => router.push("/employees/new")} className={btnAdd}>
                      <UserPlus className="w-4 h-4" />
                    </button>
                  </Tooltip>
                )}
              </div>
            </div>

            {/* Filter bar — slides down */}
            <div className={cn(
              "grid transition-all duration-200 ease-out",
              filterOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
            )}>
              <div className="overflow-hidden">
                <div className="mt-3 px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800/70 border border-gray-200 dark:border-slate-700">
                  <div className="flex flex-wrap gap-x-8 gap-y-3 items-start">
                    {/* Status pills */}
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider shrink-0">Status</span>
                      <div className="flex flex-wrap gap-1.5">
                        {statusFilterOptions.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => { setStatus(opt.value); setPage(1); }}
                            className={cn(
                              "px-3 py-1 rounded-lg text-xs font-medium transition-all duration-150 border",
                              status === opt.value
                                ? "bg-primary-600 border-primary-600 text-white shadow-sm"
                                : "bg-white dark:bg-slate-700/60 border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:border-primary-400 dark:hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                            )}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Department pills (non-manager only) */}
                    {role !== "MANAGER" && depts && depts.length > 0 && (
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider shrink-0">Dept</span>
                        <div className="flex flex-wrap gap-1.5">
                          {deptFilterOptions.map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() => { setDeptId(opt.value); setPage(1); }}
                              className={cn(
                                "px-3 py-1 rounded-lg text-xs font-medium transition-all duration-150 border",
                                deptId === opt.value
                                  ? "bg-primary-600 border-primary-600 text-white shadow-sm"
                                  : "bg-white dark:bg-slate-700/60 border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:border-primary-400 dark:hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                              )}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Reset */}
                    {filterActive && (
                      <button
                        onClick={resetFilters}
                        className="ml-auto flex items-center gap-1 text-xs text-gray-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                      >
                        <X className="w-3 h-3" />
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Table card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        {isLoading ? (
          <SkeletonTable rows={10} cols={6} />
        ) : !data?.items?.length ? (
          <EmptyState
            icon={Filter}
            title={role === "MANAGER" ? "No team members found" : "No employees found"}
            description={
              hasFilters
                ? "Try adjusting your filters."
                : role === "MANAGER"
                ? "No direct reports are assigned to you."
                : "Add your first employee to get started."
            }
            action={hasFilters ? { label: "Clear filters", onClick: clearFilters } : undefined}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50">
                    {["Employee", "Code", "Department", "Designation", "Status", "BPV"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700/60">
                  {data.items.map((emp) => {
                    const isSelected = preview?.id === emp.id;
                    const rowBtn = isSelected
                      ? "p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition-all duration-150 active:scale-95"
                      : "p-1.5 rounded-lg text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all duration-150 active:scale-95";
                    const rowBtnDanger = isSelected
                      ? "p-1.5 rounded-lg text-white/70 hover:text-red-200 hover:bg-red-500/30 transition-all duration-150 active:scale-95"
                      : "p-1.5 rounded-lg text-gray-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-150 active:scale-95";

                    return (
                      <tr
                        key={emp.id}
                        className={cn(
                          "transition-all duration-150",
                          isSelected
                            ? "bg-primary-600 dark:bg-primary-600 shadow-[inset_4px_0_0] shadow-primary-400"
                            : "hover:bg-gray-50/80 dark:hover:bg-slate-700/40"
                        )}
                      >
                        {/* Employee name + email — name is a clickable link */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <Avatar name={emp.fullName} size="sm" />
                            <div>
                              <button
                                onClick={() => handleRowClick(emp)}
                                className={cn(
                                  "font-semibold leading-tight text-left hover:underline underline-offset-2 transition-colors cursor-pointer",
                                  isSelected ? "text-white" : "text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                                )}
                              >
                                {emp.fullName}
                              </button>
                              <p className={cn(
                                "text-xs mt-0.5",
                                isSelected ? "text-primary-100" : "text-gray-400 dark:text-slate-500"
                              )}>
                                {emp.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Code */}
                        <td className={cn(
                          "px-4 py-3.5 font-mono text-xs",
                          isSelected ? "text-primary-100" : "text-gray-600 dark:text-slate-300"
                        )}>
                          {emp.employeeCode}
                        </td>

                        {/* Department */}
                        <td className={cn(
                          "px-4 py-3.5",
                          isSelected ? "text-primary-100" : "text-gray-700 dark:text-slate-300"
                        )}>
                          {emp.department.name}
                        </td>

                        {/* Designation */}
                        <td className={cn(
                          "px-4 py-3.5",
                          isSelected ? "text-primary-100" : "text-gray-700 dark:text-slate-300"
                        )}>
                          {emp.designation.title}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5">
                          {isSelected ? (
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white">
                              {statusLabel(emp.status)}
                            </span>
                          ) : (
                            <Badge variant={statusVariant(emp.status)} dot>
                              {statusLabel(emp.status)}
                            </Badge>
                          )}
                        </td>

                        {/* BPV */}
                        <td className="px-4 py-3.5">
                          {emp.latestBpvScore != null ? (
                            <span className={cn(
                              "font-bold tabular-nums",
                              isSelected
                                ? "text-white"
                                : emp.latestBpvScore >= 70
                                ? "text-emerald-600 dark:text-emerald-400"
                                : emp.latestBpvScore >= 40
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-red-600 dark:text-red-400"
                            )}>
                              {emp.latestBpvScore.toFixed(1)}
                            </span>
                          ) : (
                            <span className={isSelected ? "text-primary-200 text-xs" : "text-gray-400 text-xs"}>—</span>
                          )}
                        </td>

                        {/* Action buttons */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center justify-end gap-0.5">
                            <Tooltip label="View profile" side="left">
                              <button
                                onClick={() => router.push(`/employees/${emp.id}`)}
                                className={rowBtn}
                              >
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </Tooltip>
                            {canWrite && (
                              <Tooltip label="Edit employee" side="left">
                                <button
                                  onClick={() => router.push(`/employees/${emp.id}/edit`)}
                                  className={rowBtn}
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                              </Tooltip>
                            )}
                            {canDelete && (
                              <Tooltip label="Delete employee" side="left">
                                <button
                                  onClick={() => { setPreview(null); setDeleteTarget(emp); }}
                                  className={rowBtnDanger}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </Tooltip>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {data.pages > 1 && (
              <div className="border-t border-gray-200 dark:border-slate-700 px-4 py-3">
                <Pagination
                  page={data.page}
                  pages={data.pages}
                  total={data.total}
                  limit={data.limit}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Side panel preview ──────────────────────────────────── */}
      <SidePanel open={!!preview} onClose={() => setPreview(null)}>
        {preview && (
          <EmployeePreview
            emp={preview}
            onClose={() => setPreview(null)}
            canWrite={canWrite}
            canDelete={canDelete}
            onDelete={setDeleteTarget}
          />
        )}
      </SidePanel>

      {/* Delete confirmation modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Employee"
        size="sm"
      >
        <p className="text-sm text-gray-600 dark:text-slate-300">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-gray-900 dark:text-white">{deleteTarget?.fullName}</span>?
          This will deactivate their account and mark them as exited.
        </p>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete} loading={deleteMut.isPending}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
