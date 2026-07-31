"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
// useRef is still used by FilterChip and RowMenu (component-level)
import { useRouter } from "next/navigation";
import {
  UserPlus, Search, X, Users,
  ArrowRight, Pencil, Trash2, Mail, Phone,
  Calendar, Building2, Briefcase, UserCircle,
  ChevronDown, MoreVertical, Check,
  LayoutGrid, List as ListIcon, Download, FileSpreadsheet, FileText,
} from "lucide-react";
import {
  Button, Badge, Breadcrumb, Pagination,
  Avatar, EmptyState, SkeletonTable, Modal, SidePanel, Tooltip, BackButton,
} from "@/components/ui";
import { useEmployees, useDeleteEmployee, type EmployeeListItem } from "@/hooks/employee/useEmployees";
import { useDepartments } from "@/hooks/useMasters";
import { usePermissions } from "@/hooks/usePermissions";
import { cn } from "@/lib/utils";
import { exportEmployeesToExcel, exportEmployeesToPdf } from "@/lib/exportEmployees";

// ── Helpers ────────────────────────────────────────────────────────────────────

const statusVariant = (s: string) =>
  s === "ACTIVE" ? "success" : s === "ON_NOTICE" ? "warning" : "danger";

const statusLabel = (s: string) =>
  s === "ON_NOTICE" ? "On Notice" : s.charAt(0) + s.slice(1).toLowerCase();

const fmtDate = (d: string) =>
  new Date(d).toISOString().split("T")[0];

const bpvColor = (score: number) =>
  score >= 70 ? "#10b981" : score >= 40 ? "#f59e0b" : "#ef4444";

// ── BPV ring (used in side panel) ─────────────────────────────────────────────

function BpvRing({ score }: { score: number }) {
  const radius = 38, stroke = 7, circ = 2 * Math.PI * radius;
  const pct    = Math.min(100, Math.max(0, score)) / 100;
  const color  = bpvColor(score);
  const label  = score >= 70 ? "High" : score >= 40 ? "Developing" : "Focus";
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={100} height={100} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="currentColor" strokeWidth={stroke}
          className="text-gray-100 dark:text-slate-700" />
        <circle cx="50" cy="50" r={radius} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
          transform="rotate(-90 50 50)" style={{ transition: "stroke-dashoffset 0.8s ease" }} />
        <text x="50" y="46" textAnchor="middle" fontSize="18" fontWeight="700" fill={color}>
          {score.toFixed(1)}
        </text>
        <text x="50" y="62" textAnchor="middle" fontSize="9" fill="currentColor"
          className="fill-gray-400 dark:fill-slate-500">/ 100</text>
      </svg>
      <span className="text-xs font-medium" style={{ color }}>{label}</span>
    </div>
  );
}

// ── Info row (side panel) ──────────────────────────────────────────────────────

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 p-1.5 rounded-lg bg-gray-100 dark:bg-slate-700 shrink-0">
        <Icon className="w-3.5 h-3.5 text-gray-500 dark:text-slate-400" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-slate-500 mb-0.5">{label}</p>
        <p className="text-sm font-medium text-gray-800 dark:text-slate-200 break-all">{value}</p>
      </div>
    </div>
  );
}

// ── FilterChip ─────────────────────────────────────────────────────────────────

function FilterChip({
  label, options, value, onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === value)?.label ?? label;
  const active = !!value;

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all duration-150",
          active
            ? "border-[#27B1AE] dark:border-[#1e9e9b] bg-[#27B1AE] dark:bg-[#1e9e9b]/20 text-white dark:text-[#4fc4c1]"
            : "border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:border-[#27B1AE]/40 dark:hover:border-slate-500 hover:bg-gray-50 dark:hover:bg-slate-700/40",
        )}
      >
        {current}
        <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-150 text-gray-400 dark:text-slate-500", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-50 min-w-[160px] bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-lg shadow-black/5 dark:shadow-black/30 py-1">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 text-sm transition-colors",
                value === opt.value
                  ? "text-[#27B1AE] dark:text-[#4fc4c1] bg-[#e8f7f7] dark:bg-[#27B1AE]/20 font-semibold"
                  : "text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50",
              )}
            >
              {opt.label}
              {value === opt.value && <Check className="w-3.5 h-3.5 shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── ExportMenu (PDF / Excel) ─────────────────────────────────────────────────────

function ExportMenu({ onExportPdf, onExportExcel }: { onExportPdf: () => void; onExportExcel: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/40 transition-all duration-150"
      >
        <Download className="w-3.5 h-3.5" />
        Export
        <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-150", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-50 min-w-[170px] bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-lg shadow-black/5 dark:shadow-black/30 py-1">
          <button
            onClick={() => { setOpen(false); onExportExcel(); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Export as Excel
          </button>
          <button
            onClick={() => { setOpen(false); onExportPdf(); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-red-500 dark:text-red-400" /> Export as PDF
          </button>
        </div>
      )}
    </div>
  );
}

// ── ViewToggle (List / Grid) ─────────────────────────────────────────────────────

function ViewToggle({ view, onChange }: { view: "list" | "grid"; onChange: (v: "list" | "grid") => void }) {
  const base = "p-1.5 rounded-lg transition-all duration-150";
  const active = "bg-white dark:bg-slate-700 text-[#27B1AE] dark:text-[#4fc4c1] shadow-sm";
  const idle = "text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300";
  return (
    <div className="flex items-center gap-0.5 p-0.5 rounded-xl bg-gray-100 dark:bg-slate-900/50 shrink-0">
      <Tooltip label="List view">
        <button onClick={() => onChange("list")} className={cn(base, view === "list" ? active : idle)}>
          <ListIcon className="w-4 h-4" />
        </button>
      </Tooltip>
      <Tooltip label="Grid view">
        <button onClick={() => onChange("grid")} className={cn(base, view === "grid" ? active : idle)}>
          <LayoutGrid className="w-4 h-4" />
        </button>
      </Tooltip>
    </div>
  );
}

// ── Employee grid card ───────────────────────────────────────────────────────────

function EmployeeGridCard({
  emp, onOpen, canWrite, canDelete, onEdit, onDelete,
}: {
  emp: EmployeeListItem; onOpen: () => void;
  canWrite: boolean; canDelete: boolean;
  onEdit: () => void; onDelete: () => void;
}) {
  return (
    <div
      onClick={onOpen}
      className="group relative bg-white dark:bg-slate-800 rounded-xl border border-[#dde8f0] dark:border-slate-700 p-5 cursor-pointer hover:shadow-lg hover:shadow-gray-200/60 dark:hover:shadow-black/30 hover:-translate-y-0.5 transition-all duration-150"
    >
      <div className="absolute top-3 right-3" onClick={(e) => e.stopPropagation()}>
        <RowMenu
          isSelected={false}
          canWrite={canWrite}
          canDelete={canDelete}
          onView={onOpen}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>

      <div className="flex flex-col items-center text-center">
        <Avatar name={emp.fullName} size="lg" />
        <h3 className="mt-3 font-semibold text-gray-900 dark:text-white leading-tight truncate max-w-full">
          {emp.fullName}
        </h3>
        <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5 truncate max-w-full">
          {emp.designation.title}
        </p>
        <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5 font-mono tracking-wide">
          {emp.employeeCode}
        </p>

        <div className="mt-3">
          <Badge variant={statusVariant(emp.status)} dot>{statusLabel(emp.status)}</Badge>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700/60 grid grid-cols-2 gap-3 text-center">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-slate-500">Department</p>
          <p className="text-xs font-medium text-gray-700 dark:text-slate-300 mt-0.5 truncate">{emp.department.name}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-slate-500">BPV Score</p>
          <p
            className="text-sm font-bold tabular-nums mt-0.5"
            style={{ color: emp.latestBpvScore != null ? bpvColor(emp.latestBpvScore) : undefined }}
          >
            {emp.latestBpvScore != null ? emp.latestBpvScore.toFixed(1) : "—"}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── RowMenu (three-dot) ────────────────────────────────────────────────────────

function RowMenu({
  onView, onEdit, onDelete, canWrite, canDelete, isSelected,
}: {
  onView: () => void; onEdit: () => void; onDelete: () => void;
  canWrite: boolean; canDelete: boolean; isSelected: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} className="relative flex justify-end">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        className={cn(
          "p-1.5 rounded-lg transition-all duration-150 active:scale-95 border",
          isSelected
            ? "text-white border-white/20 bg-white/10 hover:bg-white/20"
            : "text-gray-500 dark:text-slate-400 border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-800 dark:hover:text-slate-200",
        )}
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-44 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-lg shadow-black/5 dark:shadow-black/30 py-1">
          <button
            onClick={() => { setOpen(false); onView(); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5" /> View Profile
          </button>
          {canWrite && (
            <button
              onClick={() => { setOpen(false); onEdit(); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" /> Edit Employee
            </button>
          )}
          {canDelete && (
            <>
              <div className="my-1 border-t border-gray-100 dark:border-slate-700/60" />
              <button
                onClick={() => { setOpen(false); onDelete(); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Employee side panel ────────────────────────────────────────────────────────

const panelIconBtn = "p-1.5 rounded-lg transition-colors text-gray-400 hover:text-gray-700 dark:text-slate-500 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700";
const panelIconBtnDanger = "p-1.5 rounded-lg transition-colors text-gray-400 hover:text-red-600 dark:text-slate-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20";

function EmployeePreview({
  emp, onClose, canWrite, canDelete, onDelete,
}: {
  emp: EmployeeListItem; onClose: () => void;
  canWrite: boolean; canDelete: boolean; onDelete: (emp: EmployeeListItem) => void;
}) {
  const router = useRouter();
  const headerActions = (
    <>
      <Tooltip label="View full profile" side="bottom">
        <button onClick={() => router.push(`/employees/${emp.id}`)} className={panelIconBtn}>
          <ArrowRight className="w-4 h-4" />
        </button>
      </Tooltip>
      {canWrite && (
        <Tooltip label="Edit employee" side="bottom">
          <button onClick={() => router.push(`/employees/${emp.id}/edit`)} className={panelIconBtn}>
            <Pencil className="w-4 h-4" />
          </button>
        </Tooltip>
      )}
      {canDelete && (
        <Tooltip label="Delete employee" side="bottom">
          <button onClick={() => { onClose(); onDelete(emp); }} className={panelIconBtnDanger}>
            <Trash2 className="w-4 h-4" />
          </button>
        </Tooltip>
      )}
    </>
  );

  return (
    <>
      <SidePanel.Header onClose={onClose} actions={headerActions}>Quick Preview</SidePanel.Header>
      <SidePanel.Body>
        {/* Hero */}
        <div className="px-6 py-6 flex flex-col items-center text-center border-b border-gray-100 dark:border-slate-700/60 bg-gradient-to-b from-gray-50 dark:from-slate-800/60 to-transparent">
          <Avatar name={emp.fullName} size="xl" />
          <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-white leading-tight">{emp.fullName}</h2>
          <p className="mt-0.5 font-mono text-xs text-gray-400 dark:text-slate-500 tracking-wider">{emp.employeeCode}</p>
          <div className="mt-3 flex items-center gap-2 flex-wrap justify-center">
            <Badge variant={statusVariant(emp.status)} dot>{statusLabel(emp.status)}</Badge>
            {emp.designation.grade && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#e8f7f7] dark:bg-[#27B1AE]/30 text-[#27B1AE] dark:text-[#d6a683] border border-[#e6c6ac] dark:border-[#27B1AE]">
                Grade {emp.designation.grade}
              </span>
            )}
          </div>
        </div>
        {/* BPV */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-700/60">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-slate-500 mb-4">BPV Score</p>
          {emp.latestBpvScore != null ? (
            <div className="flex justify-center"><BpvRing score={emp.latestBpvScore} /></div>
          ) : (
            <p className="text-sm text-gray-400 dark:text-slate-500 italic">No BPV score calculated yet</p>
          )}
        </div>
        {/* Details */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-slate-500">Details</p>
          <InfoRow icon={Building2} label="Department"  value={emp.department.name} />
          <InfoRow icon={Briefcase} label="Designation" value={emp.designation.title} />
          <InfoRow icon={Mail}      label="Email"       value={emp.email} />
          {emp.phone && <InfoRow icon={Phone} label="Phone" value={emp.phone} />}
          <InfoRow icon={Calendar}  label="Joined"
            value={new Date(emp.dateOfJoining).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} />
          {emp.manager && <InfoRow icon={UserCircle} label="Reports To" value={emp.manager.fullName} />}
        </div>
      </SidePanel.Body>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════

export default function EmployeesPage() {
  const router = useRouter();
  const { can, role, employeeId } = usePermissions();

  useEffect(() => {
    if (role === "EMPLOYEE" && employeeId) router.replace(`/employees/${employeeId}`);
  }, [role, employeeId, router]);

  // ── Filter / pagination state
  const [search,       setSearch]       = useState("");
  const [deptId,       setDeptId]       = useState("");
  const [status,       setStatus]       = useState("");
  const [sortBpv,      setSortBpv]      = useState<"" | "desc" | "asc">("");
  const [page,         setPage]         = useState(1);

  // ── UI state
  const [preview,      setPreview]      = useState<EmployeeListItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EmployeeListItem | null>(null);
  const [selectedIds,  setSelectedIds]  = useState<Set<string>>(new Set());
  const [view,         setView]         = useState<"list" | "grid">("list");

  const scope = role === "MANAGER" ? "team" : undefined;

  const { data, isLoading } = useEmployees({ search, departmentId: deptId, status, page, limit: 15, scope });
  const { data: depts }     = useDepartments();
  const deleteMut           = useDeleteEmployee();

  // Client-side BPV sort on current page
  const rows = useMemo(() => {
    if (!data?.items) return [];
    if (!sortBpv) return data.items;
    return [...data.items].sort((a, b) => {
      const as_ = a.latestBpvScore ?? -1, bs_ = b.latestBpvScore ?? -1;
      return sortBpv === "desc" ? bs_ - as_ : as_ - bs_;
    });
  }, [data?.items, sortBpv]);

  const hasFilters = search || deptId || status;
  const clearFilters = useCallback(() => { setSearch(""); setDeptId(""); setStatus(""); setSortBpv(""); setPage(1); }, []);

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteMut.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
  };

  const exportRows = () => (selectedIds.size ? rows.filter((e) => selectedIds.has(e.id)) : rows);
  const handleExportExcel = () => exportEmployeesToExcel(exportRows());
  const handleExportPdf   = () => exportEmployeesToPdf(exportRows());

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (!data?.items) return;
    const allIds = data.items.map((e) => e.id);
    setSelectedIds((prev) =>
      allIds.every((id) => prev.has(id)) ? new Set() : new Set(allIds),
    );
  };

  const canWrite  = can("employee:create");
  const canDelete = can("employee:delete");

  if (role === "EMPLOYEE") return null;

  const deptOptions = [
    { value: "", label: "All Departments" },
    ...(depts?.map((d) => ({ value: d.id, label: d.name })) ?? []),
  ];
  const statusOptions = [
    { value: "",          label: "All Statuses" },
    { value: "ACTIVE",    label: "Active" },
    { value: "ON_NOTICE", label: "On Notice" },
    { value: "EXITED",    label: "Exited" },
  ];
  const bpvOptions = [
    { value: "",     label: "BPV Score" },
    { value: "desc", label: "Highest first" },
    { value: "asc",  label: "Lowest first" },
  ];

  const allSelected = !!data?.items?.length && data.items.every((e) => selectedIds.has(e.id));
  const someSelected = data?.items?.some((e) => selectedIds.has(e.id)) && !allSelected;

  return (
    <div className="flex flex-col gap-4">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        <Breadcrumb items={[{ label: role === "MANAGER" ? "My Team" : "Employees" }]} />
        <BackButton href="/dashboard" label="Dashboard" />
      </div>

      {/* ── Single toolbar line ──────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-[#dde8f0] dark:border-slate-700 px-4 py-2.5 flex items-center gap-3">
        {/* Search — always visible */}
        <div className="flex items-center gap-2 border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-900/40 px-3 py-1.5 w-56 shrink-0">
          <Search className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500 shrink-0" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search employee…"
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

        {/* Filter chips */}
        {role !== "MANAGER" && (
          <FilterChip label="All Departments" options={deptOptions} value={deptId}
            onChange={(v) => { setDeptId(v); setPage(1); }} />
        )}
        <FilterChip label="All Statuses" options={statusOptions} value={status}
          onChange={(v) => { setStatus(v); setPage(1); }} />
        <FilterChip label="BPV Score" options={bpvOptions} value={sortBpv}
          onChange={(v) => setSortBpv(v as "" | "desc" | "asc")} />

        {/* Clear filters */}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs text-gray-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors shrink-0"
          >
            <X className="w-3 h-3" /> Clear
          </button>
        )}

        <div className="flex-1" />

        {/* Record count */}
        {data?.total != null && selectedIds.size === 0 && (
          <span className="text-xs text-gray-400 dark:text-slate-500 tabular-nums shrink-0">
            {data.total} {data.total === 1 ? "employee" : "employees"}
          </span>
        )}
        {selectedIds.size > 0 && (
          <span className="text-xs font-medium text-[#1e9e9b] dark:text-[#4fc4c1] shrink-0">
            {selectedIds.size} selected
          </span>
        )}

        {/* View toggle */}
        <ViewToggle view={view} onChange={setView} />

        {/* Export */}
        <ExportMenu onExportPdf={handleExportPdf} onExportExcel={handleExportExcel} />

        {/* Add employee */}
        {canWrite && (
          <Button
            onClick={() => router.push("/employees/new")}
            leftIcon={<UserPlus className="w-4 h-4" />}
            className="shrink-0"
          >
            Add Employee
          </Button>
        )}
      </div>

      {/* ── Empty / loading (shared across views) ───────────────────────────── */}
      {isLoading ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-[#dde8f0] dark:border-slate-700 overflow-visible">
          <SkeletonTable rows={10} cols={6} />
        </div>
      ) : !rows.length ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-[#dde8f0] dark:border-slate-700 overflow-visible">
          <EmptyState
            icon={Users}
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
        </div>
      ) : view === "grid" ? (
        <>
          {/* ── Grid card layout ─────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {rows.map((emp) => (
              <EmployeeGridCard
                key={emp.id}
                emp={emp}
                canWrite={canWrite}
                canDelete={canDelete}
                onOpen={() => setPreview((p) => (p?.id === emp.id ? null : emp))}
                onEdit={() => router.push(`/employees/${emp.id}/edit`)}
                onDelete={() => { setPreview(null); setDeleteTarget(emp); }}
              />
            ))}
          </div>

          {(data?.pages ?? 0) > 1 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-[#dde8f0] dark:border-slate-700 px-4 py-3">
              <Pagination
                page={data!.page}
                pages={data!.pages}
                total={data!.total}
                limit={data!.limit}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      ) : (
      /* ── Table card ───────────────────────────────────────────────────────── */
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-[#dde8f0] dark:border-slate-700 overflow-visible">
        <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50">
                    {/* Checkbox */}
                    <th className="w-10 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        ref={(el) => { if (el) el.indeterminate = someSelected; }}
                        onChange={toggleAll}
                        className="w-4 h-4 rounded border-gray-300 dark:border-slate-600 accent-[#1e9e9b] cursor-pointer"
                      />
                    </th>
                    {[
                      { label: "Employee",   className: "" },
                      { label: "Department", className: "" },
                      { label: "Joined",     className: "" },
                      { label: "BPV Score",  className: "" },
                      { label: "Status",     className: "" },
                    ].map(({ label, className }) => (
                      <th key={label} className={cn(
                        "px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap",
                        className,
                      )}>
                        {label}
                      </th>
                    ))}
                    <th className="px-4 py-3 w-10" />
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 dark:divide-slate-700/60">
                  {rows.map((emp) => {
                    const isSelected = preview?.id === emp.id;
                    const isTicked   = selectedIds.has(emp.id);

                    return (
                      <tr
                        key={emp.id}
                        onClick={() => setPreview((p) => p?.id === emp.id ? null : emp)}
                        className={cn(
                          "transition-all duration-150 cursor-pointer",
                          isSelected
                            ? "bg-[#1e9e9b] dark:bg-[#1e9e9b] shadow-[inset_4px_0_0] shadow-[#4fc4c1]"
                            : "hover:bg-gray-50/80 dark:hover:bg-slate-700/40",
                        )}
                      >
                        {/* Checkbox */}
                        <td className="w-10 px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isTicked}
                            onChange={() => toggleSelect(emp.id)}
                            className="w-4 h-4 rounded border-gray-300 dark:border-slate-600 accent-[#1e9e9b] cursor-pointer"
                          />
                        </td>

                        {/* Employee cell */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <Avatar name={emp.fullName} size="sm" />
                            <div className="min-w-0">
                              <p className={cn(
                                "font-semibold leading-tight truncate",
                                isSelected ? "text-white" : "text-gray-900 dark:text-white",
                              )}>
                                {emp.fullName}
                              </p>
                              <p className={cn(
                                "text-xs mt-0.5 truncate",
                                isSelected ? "text-[#f3e2d6]" : "text-gray-400 dark:text-slate-500",
                              )}>
                                {emp.designation.title}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Department */}
                        <td className={cn(
                          "px-4 py-3.5 text-sm",
                          isSelected ? "text-[#f3e2d6]" : "text-gray-600 dark:text-slate-300",
                        )}>
                          {emp.department.name}
                        </td>

                        {/* Joined */}
                        <td className={cn(
                          "px-4 py-3.5 text-sm tabular-nums",
                          isSelected ? "text-[#f3e2d6]" : "text-gray-500 dark:text-slate-400",
                        )}>
                          {fmtDate(emp.dateOfJoining)}
                        </td>

                        {/* BPV Score */}
                        <td className="px-4 py-3.5">
                          {emp.latestBpvScore != null ? (
                            <span
                              className="text-sm font-bold tabular-nums"
                              style={{ color: isSelected ? "white" : bpvColor(emp.latestBpvScore) }}
                            >
                              {emp.latestBpvScore.toFixed(1)}
                            </span>
                          ) : (
                            <span className={isSelected ? "text-[#e6c6ac] text-sm" : "text-gray-400 dark:text-slate-500 text-sm"}>—</span>
                          )}
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

                        {/* Three-dot menu */}
                        <td className="px-4 py-3.5 w-10" onClick={(e) => e.stopPropagation()}>
                          <RowMenu
                            isSelected={isSelected}
                            canWrite={canWrite}
                            canDelete={canDelete}
                            onView={() => router.push(`/employees/${emp.id}`)}
                            onEdit={() => router.push(`/employees/${emp.id}/edit`)}
                            onDelete={() => { setPreview(null); setDeleteTarget(emp); }}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {(data?.pages ?? 0) > 1 && (
              <div className="border-t border-gray-200 dark:border-slate-700 px-4 py-3">
                <Pagination
                  page={data!.page}
                  pages={data!.pages}
                  total={data!.total}
                  limit={data!.limit}
                  onPageChange={setPage}
                />
              </div>
            )}
        </>
      </div>
      )}

      {/* Side panel */}
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

      {/* Delete modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Employee" size="sm">
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
