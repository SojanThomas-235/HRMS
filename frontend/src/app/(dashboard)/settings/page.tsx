"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Building2, Briefcase, Star, GraduationCap, Award,
  Settings2, Plus, Pencil, ToggleLeft, ToggleRight,
  TrendingUp, Network, ChevronDown, ChevronRight as ChevronRightIcon,
  ArrowUpDown, ArrowUp, ArrowDown, X, Search, SlidersHorizontal,
} from "lucide-react";
import {
  Button, Input, Select, Tabs, Modal, FormField, Card, Badge, Pagination,
  Tooltip, BackButton,
} from "@/components/ui";
import { RoleGuard } from "@/components/auth";
import { useTableControls, type SortState } from "@/hooks/useTableControls";
import {
  useDepartmentsConfig, useDesignationsConfig, useQualificationsConfig,
  useSkillCategoriesConfig, useSkillsConfig, useProficiencyConfig,
  useCertificationsConfig, useExpTypesConfig, useOrgTypesConfig,
  useBpvConfig, useExpBandsConfig,
  useCreateDept, useUpdateDept,
  useCreateDesig, useUpdateDesig,
  useCreateQual, useUpdateQual,
  useCreateSkillCat, useUpdateSkillCat,
  useCreateSkill, useUpdateSkill,
  useCreateProf, useUpdateProf,
  useCreateCert, useUpdateCert,
  useCreateExpType, useUpdateExpType,
  useCreateOrgType, useUpdateOrgType,
  useCreateBpvConfig,
  useCreateExpBand, useUpdateExpBand,
  type Department, type Designation, type QualType, type SkillCategory,
  type SkillItem, type Proficiency, type Certification, type ExpType,
  type OrgType, type ExpBand,
} from "@/hooks/useConfig";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

// ── Helpers ───────────────────────────────────────────────────────────────────

function errMsg(e: unknown, fallback: string) {
  return (e as { response?: { data?: { error?: { message?: string } } } })
    ?.response?.data?.error?.message ?? fallback;
}

function ActiveBadge({ active }: { active: boolean }) {
  return <Badge variant={active ? "success" : "secondary"}>{active ? "Active" : "Inactive"}</Badge>;
}

// ── Sortable table header ─────────────────────────────────────────────────────

interface ColDef { label: string; sortKey?: string; className?: string; }

function SortableHeader({ cols, sort, onSort }: { cols: (ColDef | string)[]; sort: SortState; onSort: (k: string) => void }) {
  return (
    <thead>
      <tr className="border-b border-gray-100 dark:border-slate-700">
        {cols.map((col, i) => {
          const label    = typeof col === "string" ? col : col.label;
          const sortKey  = typeof col === "string" ? undefined : col.sortKey;
          const extraCls = typeof col === "string" ? "" : (col.className ?? "");
          const active   = sortKey && sort.key === sortKey;
          return (
            <th key={i} onClick={() => sortKey && onSort(sortKey)}
              className={cn("px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide select-none",
                sortKey && "cursor-pointer hover:text-gray-800 dark:hover:text-slate-200", extraCls)}>
              <span className="inline-flex items-center gap-1">
                {label}
                {sortKey && (active
                  ? sort.dir === "asc" ? <ArrowUp className="w-3 h-3 text-primary-500" /> : <ArrowDown className="w-3 h-3 text-primary-500" />
                  : <ArrowUpDown className="w-3 h-3 text-gray-300 dark:text-slate-600" />)}
              </span>
            </th>
          );
        })}
      </tr>
    </thead>
  );
}

// ── Table footer ──────────────────────────────────────────────────────────────

function TableFooter({ page, totalPages, total, pageSize, onPageChange }: {
  page: number; totalPages: number; total: number; pageSize: number; onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="px-4 py-3 border-t border-gray-100 dark:border-slate-700">
      <Pagination page={page} pages={totalPages} total={total} limit={pageSize} onPageChange={onPageChange} />
    </div>
  );
}

// ── Empty row ─────────────────────────────────────────────────────────────────

function EmptyRow({ cols, message = "No items yet" }: { cols: number; message?: string }) {
  return (
    <tr><td colSpan={cols} className="px-4 py-8 text-center text-sm text-gray-400 dark:text-slate-500">{message}</td></tr>
  );
}

// ── Tab toolbar ───────────────────────────────────────────────────────────────
//   · Search: opens on hover (stays open while hovered or focused or has value)
//   · Filter: click-driven dropdown, supports multiple filter groups

interface FilterOption  { value: string; label: string }
interface FilterGroup   { label: string; value: string; onChange: (v: string) => void; options: FilterOption[] }

function TabToolbar({
  title, desc, onAdd, addLabel,
  searchValue, onSearchChange,
  filterGroups = [],
}: {
  title: string; desc: string;
  onAdd: () => void; addLabel?: string;
  searchValue: string; onSearchChange: (q: string) => void;
  filterGroups?: FilterGroup[];
}) {
  const [hovered,  setHovered]  = useState(false);
  const [focused,  setFocused]  = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Input slides out on hover OR focus OR if value is present
  const searchOpen = hovered || focused || !!searchValue;

  // Dot indicator: any filter group is not on its default "all" value
  const filterActive = filterGroups.some((g) => g.value !== g.options[0]?.value);

  const btnBase   = "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 active:scale-95 shrink-0";
  const btnIdle   = cn(btnBase, "text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700");
  const btnLit    = cn(btnBase, "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400");
  const btnAdd    = cn(btnBase, "bg-primary-600 hover:bg-primary-700 text-white shadow-sm shadow-primary-600/20");

  return (
    <div className="flex items-center justify-between mb-4 gap-4">
      {/* Left */}
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white truncate">{title}</h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">{desc}</p>
      </div>

      {/* Right controls — all on one line */}
      <div className="flex items-center gap-2 shrink-0">

        {/* Search: hover wrapper covers both icon + expanding input */}
        <div
          className="flex items-center gap-2"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {/* Expanding input */}
          <div className={cn(
            "flex items-center overflow-hidden transition-all duration-200",
            searchOpen ? "w-52 opacity-100" : "w-0 opacity-0 pointer-events-none",
          )}>
            <div className="flex items-center gap-1.5 w-full border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 px-3 py-1.5 shadow-sm">
              <Search className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500 shrink-0" />
              <input
                ref={inputRef}
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Search…"
                className="flex-1 text-sm bg-transparent outline-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 min-w-0"
              />
              {searchValue && (
                <button
                  onMouseDown={(e) => { e.preventDefault(); onSearchChange(""); }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Search icon — visual indicator, hover area is the parent wrapper */}
          <div className={searchOpen ? btnLit : btnIdle}>
            <Search className="w-4 h-4" />
          </div>
        </div>

        {/* Filter button + multi-group dropdown */}
        {filterGroups.length > 0 && (
          <div className="relative">
            <Tooltip label="Filter">
              <button
                onClick={() => setFilterOpen((v) => !v)}
                className={cn(filterOpen || filterActive ? btnLit : btnIdle, "relative")}
              >
                <SlidersHorizontal className="w-4 h-4" />
                {filterActive && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary-500" />
                )}
              </button>
            </Tooltip>

            {filterOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setFilterOpen(false)} />
                <div className="absolute right-0 top-full mt-1.5 z-20 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden min-w-[180px]">
                  {filterGroups.map((group, gi) => (
                    <div key={gi} className={cn("p-3", gi > 0 && "border-t border-gray-100 dark:border-slate-700")}>
                      <p className="text-[10px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                        {group.label}
                      </p>
                      <div className="flex flex-col gap-0.5">
                        {group.options.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => group.onChange(opt.value)}
                            className={cn(
                              "w-full text-left px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-2",
                              group.value === opt.value
                                ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-medium"
                                : "text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50"
                            )}
                          >
                            {/* Radio dot */}
                            <span className={cn(
                              "w-3.5 h-3.5 rounded-full border-2 shrink-0 flex items-center justify-center",
                              group.value === opt.value
                                ? "border-primary-500 bg-primary-500"
                                : "border-gray-300 dark:border-slate-600"
                            )}>
                              {group.value === opt.value && (
                                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                              )}
                            </span>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Reset all */}
                  {filterActive && (
                    <div className="px-3 pb-3 border-t border-gray-100 dark:border-slate-700 pt-2">
                      <button
                        onClick={() => { filterGroups.forEach((g) => g.onChange(g.options[0]?.value ?? "all")); }}
                        className="w-full text-center text-xs text-gray-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors py-1"
                      >
                        Reset all filters
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Add */}
        <Tooltip label={addLabel ?? `Add ${title.toLowerCase()}`}>
          <button onClick={onAdd} className={btnAdd}>
            <Plus className="w-4 h-4" />
          </button>
        </Tooltip>
      </div>
    </div>
  );
}

// ── Status filter group (reused across all tabs) ──────────────────────────────

const STATUS_OPTIONS: FilterOption[] = [
  { value: "all",      label: "All status" },
  { value: "active",   label: "Active only" },
  { value: "inactive", label: "Inactive only" },
];

// ── Skill tag chip ────────────────────────────────────────────────────────────

function SkillTag({ skill, onEdit, onToggle }: { skill: SkillItem; onEdit: () => void; onToggle: () => void }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 pl-2.5 pr-1 py-1 rounded-full text-xs font-medium border transition-colors",
      skill.isActive
        ? "bg-blue-50 dark:bg-blue-900/25 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700"
        : "bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500 border-gray-200 dark:border-slate-600 line-through"
    )}>
      {skill.name}
      <button onClick={onEdit} title="Edit" className="p-0.5 rounded-full hover:bg-blue-100 dark:hover:bg-blue-800/40 text-blue-400 hover:text-blue-600 dark:hover:text-blue-200 transition-colors">
        <Pencil className="w-2.5 h-2.5" />
      </button>
      <button onClick={onToggle} title={skill.isActive ? "Deactivate" : "Activate"} className="p-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 transition-colors">
        <X className="w-2.5 h-2.5" />
      </button>
    </span>
  );
}

// ── Row action buttons ────────────────────────────────────────────────────────

function RowActions({ onEdit, isActive, onToggle }: { onEdit: () => void; isActive: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center gap-2 justify-end">
      <Tooltip label="Edit" side="left">
        <button onClick={onEdit} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
          <Pencil className="w-3.5 h-3.5" />
        </button>
      </Tooltip>
      <Tooltip label={isActive ? "Deactivate" : "Activate"} side="left">
        <button onClick={onToggle} className="p-1.5 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
          {isActive ? <ToggleRight className="w-4 h-4 text-green-500" /> : <ToggleLeft className="w-4 h-4" />}
        </button>
      </Tooltip>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// TAB 1 — DEPARTMENTS
// ══════════════════════════════════════════════════════════════════

function DepartmentsTab() {
  const { data = [] } = useDepartmentsConfig();
  const create = useCreateDept();
  const update = useUpdateDept();

  type F = { name: string; code: string; description: string };
  const [modal, setModal] = useState<{ open: boolean; item?: Department }>({ open: false });
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<F>();

  const [search, setSearch]   = useState("");
  const [status, setStatus]   = useState("all");

  const filtered = (data as unknown as Department[])
    .filter((d) => { const q = search.toLowerCase(); return !q || d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q) || (d.description ?? "").toLowerCase().includes(q); })
    .filter((d) => status === "all" || (status === "active" ? d.isActive : !d.isActive));

  const tc   = useTableControls(filtered as unknown as Record<string, unknown>[], { defaultSortKey: "name", pageSize: 8 });
  const rows = tc.rows as unknown as Department[];

  const openAdd  = () => { reset({ name: "", code: "", description: "" }); setModal({ open: true }); };
  const openEdit = (d: Department) => { reset({ name: d.name, code: d.code, description: d.description ?? "" }); setModal({ open: true, item: d }); };
  const close    = () => setModal({ open: false });

  const onSubmit = (vals: F) => {
    const payload = { ...vals, code: vals.code.toUpperCase() };
    const mut = modal.item ? update.mutateAsync({ id: modal.item.id, ...payload }) : create.mutateAsync(payload);
    mut.then(() => { toast.success(modal.item ? "Department updated" : "Department created"); close(); }).catch((e) => toast.error(errMsg(e, "Failed")));
  };

  const toggle = (d: Department) =>
    update.mutateAsync({ id: d.id, isActive: !d.isActive })
      .then(() => toast.success(`Department ${d.isActive ? "deactivated" : "activated"}`))
      .catch((e) => toast.error(errMsg(e, "Failed")));

  return (
    <div>
      <TabToolbar
        title="Departments" desc="Manage organisational departments"
        onAdd={openAdd}
        searchValue={search} onSearchChange={setSearch}
        filterGroups={[{ label: "Status", value: status, onChange: setStatus, options: STATUS_OPTIONS }]}
      />
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <SortableHeader sort={tc.sort} onSort={tc.toggleSort} cols={[
              { label: "Name",        sortKey: "name" },
              { label: "Code",        sortKey: "code" },
              { label: "Description", sortKey: "description" },
              { label: "Status",      sortKey: "isActive" },
              { label: "" },
            ]} />
            <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
              {rows.length === 0 && <EmptyRow cols={5} message={search ? "No results" : "No items yet"} />}
              {rows.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/30">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{d.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-slate-400">{d.code}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-slate-400 max-w-xs truncate">{d.description ?? "—"}</td>
                  <td className="px-4 py-3"><ActiveBadge active={d.isActive} /></td>
                  <td className="px-4 py-3"><RowActions onEdit={() => openEdit(d)} isActive={d.isActive} onToggle={() => toggle(d)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <TableFooter {...tc} onPageChange={tc.setPage} />
      </Card>

      <Modal open={modal.open} onClose={close} title={modal.item ? "Edit Department" : "Add Department"}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <FormField label="Name" required error={errors.name?.message}><Input {...register("name", { required: "Required" })} placeholder="e.g. Engineering" /></FormField>
          <FormField label="Code" required error={errors.code?.message} hint="Auto-uppercased"><Input {...register("code", { required: "Required" })} placeholder="e.g. ENG" /></FormField>
          <FormField label="Description" error={errors.description?.message}><Input {...register("description")} placeholder="Optional description" /></FormField>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={close}>Cancel</Button>
            <Button type="submit" loading={isSubmitting}>{modal.item ? "Save" : "Create"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// TAB 2 — DESIGNATIONS
// ══════════════════════════════════════════════════════════════════

function DesignationsTab() {
  const { data = [] } = useDesignationsConfig();
  const create = useCreateDesig();
  const update = useUpdateDesig();

  type F = { title: string; code: string; grade: string };
  const [modal, setModal] = useState<{ open: boolean; item?: Designation }>({ open: false });
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<F>();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  // Collect unique grades for the grade filter
  const allGrades = Array.from(new Set((data as unknown as Designation[]).map((d) => d.grade).filter(Boolean))) as string[];
  const [grade, setGrade] = useState("all");

  const gradeOptions: FilterOption[] = [
    { value: "all", label: "All grades" },
    ...allGrades.map((g) => ({ value: g, label: g })),
  ];

  const filtered = (data as unknown as Designation[])
    .filter((d) => { const q = search.toLowerCase(); return !q || d.title.toLowerCase().includes(q) || d.code.toLowerCase().includes(q) || (d.grade ?? "").toLowerCase().includes(q); })
    .filter((d) => status === "all" || (status === "active" ? d.isActive : !d.isActive))
    .filter((d) => grade === "all" || d.grade === grade);

  const tc   = useTableControls(filtered as unknown as Record<string, unknown>[], { defaultSortKey: "title", pageSize: 8 });
  const rows = tc.rows as unknown as Designation[];

  const openAdd  = () => { reset({ title: "", code: "", grade: "" }); setModal({ open: true }); };
  const openEdit = (d: Designation) => { reset({ title: d.title, code: d.code, grade: d.grade ?? "" }); setModal({ open: true, item: d }); };
  const close    = () => setModal({ open: false });

  const onSubmit = (vals: F) => {
    const payload = { ...vals, code: vals.code.toUpperCase(), grade: vals.grade || undefined };
    const mut = modal.item ? update.mutateAsync({ id: modal.item.id, ...payload }) : create.mutateAsync(payload);
    mut.then(() => { toast.success(modal.item ? "Designation updated" : "Designation created"); close(); }).catch((e) => toast.error(errMsg(e, "Failed")));
  };

  const toggle = (d: Designation) =>
    update.mutateAsync({ id: d.id, isActive: !d.isActive })
      .then(() => toast.success(`Designation ${d.isActive ? "deactivated" : "activated"}`))
      .catch((e) => toast.error(errMsg(e, "Failed")));

  return (
    <div>
      <TabToolbar
        title="Designations" desc="Job titles and grades"
        onAdd={openAdd}
        searchValue={search} onSearchChange={setSearch}
        filterGroups={[
          { label: "Status", value: status, onChange: setStatus, options: STATUS_OPTIONS },
          ...(allGrades.length > 0 ? [{ label: "Grade", value: grade, onChange: setGrade, options: gradeOptions }] : []),
        ]}
      />
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <SortableHeader sort={tc.sort} onSort={tc.toggleSort} cols={[
              { label: "Title",  sortKey: "title" },
              { label: "Code",   sortKey: "code" },
              { label: "Grade",  sortKey: "grade" },
              { label: "Status", sortKey: "isActive" },
              { label: "" },
            ]} />
            <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
              {rows.length === 0 && <EmptyRow cols={5} message={search ? "No results" : "No items yet"} />}
              {rows.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/30">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{d.title}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-slate-400">{d.code}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-slate-400">{d.grade ?? "—"}</td>
                  <td className="px-4 py-3"><ActiveBadge active={d.isActive} /></td>
                  <td className="px-4 py-3"><RowActions onEdit={() => openEdit(d)} isActive={d.isActive} onToggle={() => toggle(d)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <TableFooter {...tc} onPageChange={tc.setPage} />
      </Card>

      <Modal open={modal.open} onClose={close} title={modal.item ? "Edit Designation" : "Add Designation"}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <FormField label="Title" required error={errors.title?.message}><Input {...register("title", { required: "Required" })} placeholder="e.g. Senior Software Engineer" /></FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Code" required error={errors.code?.message}><Input {...register("code", { required: "Required" })} placeholder="e.g. SSE" /></FormField>
            <FormField label="Grade" error={errors.grade?.message}><Input {...register("grade")} placeholder="e.g. L3" /></FormField>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={close}>Cancel</Button>
            <Button type="submit" loading={isSubmitting}>{modal.item ? "Save" : "Create"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// TAB 3 — SKILLS & PROFICIENCY
// ══════════════════════════════════════════════════════════════════

function SkillCategoryRow({ cat, allSkills, onEditCat, onToggleCat, onEditSkill, onToggleSkill, onAddSkill }: {
  cat: SkillCategory; allSkills: SkillItem[];
  onEditCat: () => void; onToggleCat: () => void;
  onEditSkill: (s: SkillItem) => void; onToggleSkill: (s: SkillItem) => void;
  onAddSkill: (catId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const catSkills = allSkills.filter((s) => s.categoryId === cat.id);
  return (
    <>
      <tr className="hover:bg-gray-50/50 dark:hover:bg-slate-700/30">
        <td className="px-4 py-3">
          <button onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-2 font-medium text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            {expanded ? <ChevronDown className="w-3.5 h-3.5 shrink-0 text-primary-500" /> : <ChevronRightIcon className="w-3.5 h-3.5 shrink-0 text-gray-400" />}
            {cat.name}
          </button>
        </td>
        <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-slate-400">{cat.code}</td>
        <td className="px-4 py-3 text-gray-500 dark:text-slate-400 text-sm">{catSkills.length}</td>
        <td className="px-4 py-3"><ActiveBadge active={cat.isActive} /></td>
        <td className="px-4 py-3"><RowActions onEdit={onEditCat} isActive={cat.isActive} onToggle={onToggleCat} /></td>
      </tr>
      {expanded && (
        <tr className="bg-gray-50/70 dark:bg-slate-800/40">
          <td colSpan={5} className="px-6 py-3">
            <div className="flex flex-wrap gap-2 items-center">
              {catSkills.length === 0 && <span className="text-xs text-gray-400 dark:text-slate-500 italic">No skills yet</span>}
              {catSkills.map((s) => <SkillTag key={s.id} skill={s} onEdit={() => onEditSkill(s)} onToggle={() => onToggleSkill(s)} />)}
              <button onClick={() => onAddSkill(cat.id)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border border-dashed border-gray-300 dark:border-slate-600 text-gray-500 dark:text-slate-400 hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                <Plus className="w-3 h-3" /> Add skill
              </button>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function SkillsTab() {
  const { data: cats = [] }   = useSkillCategoriesConfig();
  const { data: skills = [] } = useSkillsConfig();
  const { data: profs = [] }  = useProficiencyConfig();

  const createCat   = useCreateSkillCat();
  const updateCat   = useUpdateSkillCat();
  const createSkill = useCreateSkill();
  const updateSkill = useUpdateSkill();
  const createProf  = useCreateProf();
  const updateProf  = useUpdateProf();

  type CatF   = { name: string; code: string };
  type SkillF = { name: string; code: string; categoryId: string };
  type ProfF  = { level: string; code: string; sortOrder: string; scoreMultiplier: string };

  const [catModal,   setCatModal]   = useState<{ open: boolean; item?: SkillCategory }>({ open: false });
  const [skillModal, setSkillModal] = useState<{ open: boolean; item?: SkillItem; defaultCatId?: string }>({ open: false });
  const [profModal,  setProfModal]  = useState<{ open: boolean; item?: Proficiency }>({ open: false });

  const catForm   = useForm<CatF>();
  const skillForm = useForm<SkillF>();
  const profForm  = useForm<ProfF>();

  const [catSearch,  setCatSearch]  = useState("");
  const [catStatus,  setCatStatus]  = useState("all");
  const [profSearch, setProfSearch] = useState("");
  const [profStatus, setProfStatus] = useState("all");

  const filteredCats = (cats as unknown as SkillCategory[])
    .filter((c) => { const q = catSearch.toLowerCase(); return !q || c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q); })
    .filter((c) => catStatus === "all" || (catStatus === "active" ? c.isActive : !c.isActive));

  const filteredProfs = (profs as unknown as Proficiency[])
    .filter((p) => { const q = profSearch.toLowerCase(); return !q || p.level.toLowerCase().includes(q) || p.code.toLowerCase().includes(q); })
    .filter((p) => profStatus === "all" || (profStatus === "active" ? p.isActive : !p.isActive));

  const catTc  = useTableControls(filteredCats  as unknown as Record<string, unknown>[], { defaultSortKey: "name",      pageSize: 8 });
  const profTc = useTableControls(filteredProfs as unknown as Record<string, unknown>[], { defaultSortKey: "sortOrder", pageSize: 8 });

  const toggleCat   = (c: SkillCategory) => updateCat.mutateAsync({ id: c.id, isActive: !c.isActive }).then(() => toast.success("Updated")).catch((e: unknown) => toast.error(errMsg(e, "Failed")));
  const toggleSkill = (s: SkillItem)     => updateSkill.mutateAsync({ id: s.id, isActive: !s.isActive }).then(() => toast.success("Updated")).catch((e: unknown) => toast.error(errMsg(e, "Failed")));
  const toggleProf  = (p: Proficiency)   => updateProf.mutateAsync({ id: p.id, isActive: !p.isActive }).then(() => toast.success("Updated")).catch((e: unknown) => toast.error(errMsg(e, "Failed")));

  const onCat = catForm.handleSubmit((v) => {
    const mut = catModal.item ? updateCat.mutateAsync({ id: catModal.item.id, ...v }) : createCat.mutateAsync(v);
    mut.then(() => { toast.success("Category saved"); setCatModal({ open: false }); }).catch((e: unknown) => toast.error(errMsg(e, "Failed")));
  });
  const onSkill = skillForm.handleSubmit((v) => {
    const payload = { ...v, code: v.code.toUpperCase() };
    const mut = skillModal.item ? updateSkill.mutateAsync({ id: skillModal.item.id, ...payload }) : createSkill.mutateAsync(payload);
    mut.then(() => { toast.success("Skill saved"); setSkillModal({ open: false }); }).catch((e: unknown) => toast.error(errMsg(e, "Failed")));
  });
  const onProf = profForm.handleSubmit((v) => {
    const payload = { level: v.level, code: v.code, sortOrder: parseInt(v.sortOrder), scoreMultiplier: parseFloat(v.scoreMultiplier) };
    const mut = profModal.item ? updateProf.mutateAsync({ id: profModal.item.id, ...payload }) : createProf.mutateAsync(payload);
    mut.then(() => { toast.success("Proficiency saved"); setProfModal({ open: false }); }).catch((e: unknown) => toast.error(errMsg(e, "Failed")));
  });

  const openAddSkill  = (catId: string) => { skillForm.reset({ name: "", code: "", categoryId: catId }); setSkillModal({ open: true, defaultCatId: catId }); };
  const openEditSkill = (s: SkillItem)  => { skillForm.reset({ name: s.name, code: s.code, categoryId: s.categoryId }); setSkillModal({ open: true, item: s }); };
  const catRows  = catTc.rows  as unknown as SkillCategory[];
  const profRows = profTc.rows as unknown as Proficiency[];

  return (
    <div className="flex flex-col gap-8">
      {/* Categories */}
      <div>
        <TabToolbar
          title="Skill Categories" desc="Click a category row to expand and manage its skills"
          addLabel="Add category"
          onAdd={() => { catForm.reset({ name: "", code: "" }); setCatModal({ open: true }); }}
          searchValue={catSearch} onSearchChange={setCatSearch}
          filterGroups={[{ label: "Status", value: catStatus, onChange: setCatStatus, options: STATUS_OPTIONS }]}
        />
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <SortableHeader sort={catTc.sort} onSort={catTc.toggleSort} cols={[
                { label: "Category", sortKey: "name" }, { label: "Code", sortKey: "code" },
                { label: "Skills" }, { label: "Status", sortKey: "isActive" }, { label: "" },
              ]} />
              <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
                {catRows.length === 0 && <EmptyRow cols={5} message={catSearch ? "No results" : "No items yet"} />}
                {catRows.map((c) => (
                  <SkillCategoryRow key={c.id} cat={c} allSkills={skills}
                    onEditCat={() => { catForm.reset({ name: c.name, code: c.code }); setCatModal({ open: true, item: c }); }}
                    onToggleCat={() => toggleCat(c)} onEditSkill={openEditSkill} onToggleSkill={toggleSkill} onAddSkill={openAddSkill}
                  />
                ))}
              </tbody>
            </table>
          </div>
          <TableFooter {...catTc} onPageChange={catTc.setPage} />
        </Card>
      </div>

      {/* Proficiency Levels */}
      <div>
        <TabToolbar
          title="Proficiency Levels" desc="Score multipliers applied per skill proficiency"
          addLabel="Add proficiency level"
          onAdd={() => { profForm.reset({ level: "", code: "", sortOrder: "", scoreMultiplier: "" }); setProfModal({ open: true }); }}
          searchValue={profSearch} onSearchChange={setProfSearch}
          filterGroups={[{ label: "Status", value: profStatus, onChange: setProfStatus, options: STATUS_OPTIONS }]}
        />
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <SortableHeader sort={profTc.sort} onSort={profTc.toggleSort} cols={[
                { label: "Level", sortKey: "level" }, { label: "Code", sortKey: "code" },
                { label: "Sort Order", sortKey: "sortOrder" }, { label: "Multiplier", sortKey: "scoreMultiplier" },
                { label: "Status", sortKey: "isActive" }, { label: "" },
              ]} />
              <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
                {profRows.length === 0 && <EmptyRow cols={6} message={profSearch ? "No results" : "No items yet"} />}
                {profRows.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/30">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{p.level}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-slate-400">{p.code}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-slate-400">{p.sortOrder}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-slate-400">{p.scoreMultiplier}×</td>
                    <td className="px-4 py-3"><ActiveBadge active={p.isActive} /></td>
                    <td className="px-4 py-3">
                      <RowActions
                        onEdit={() => { profForm.reset({ level: p.level, code: p.code, sortOrder: String(p.sortOrder), scoreMultiplier: String(p.scoreMultiplier) }); setProfModal({ open: true, item: p }); }}
                        isActive={p.isActive} onToggle={() => toggleProf(p)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <TableFooter {...profTc} onPageChange={profTc.setPage} />
        </Card>
      </div>

      <Modal open={catModal.open} onClose={() => setCatModal({ open: false })} title={catModal.item ? "Edit Category" : "Add Skill Category"}>
        <form onSubmit={onCat} className="flex flex-col gap-4">
          <FormField label="Name" required><Input {...catForm.register("name", { required: true })} placeholder="e.g. Frontend" /></FormField>
          <FormField label="Code" required><Input {...catForm.register("code", { required: true })} placeholder="e.g. FE" /></FormField>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setCatModal({ open: false })}>Cancel</Button>
            <Button type="submit">{catModal.item ? "Save" : "Create"}</Button>
          </div>
        </form>
      </Modal>
      <Modal open={skillModal.open} onClose={() => setSkillModal({ open: false })} title={skillModal.item ? "Edit Skill" : "Add Skill"}>
        <form onSubmit={onSkill} className="flex flex-col gap-4">
          <FormField label="Name" required><Input {...skillForm.register("name", { required: true })} placeholder="e.g. React" /></FormField>
          <FormField label="Code" required><Input {...skillForm.register("code", { required: true })} placeholder="e.g. REACT" /></FormField>
          <FormField label="Category" required>
            <Select {...skillForm.register("categoryId", { required: true })} options={[{ value: "", label: "Select category" }, ...cats.map((c) => ({ value: c.id, label: c.name }))]} />
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setSkillModal({ open: false })}>Cancel</Button>
            <Button type="submit">{skillModal.item ? "Save" : "Create"}</Button>
          </div>
        </form>
      </Modal>
      <Modal open={profModal.open} onClose={() => setProfModal({ open: false })} title={profModal.item ? "Edit Proficiency Level" : "Add Proficiency Level"}>
        <form onSubmit={onProf} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Level Name" required><Input {...profForm.register("level", { required: true })} placeholder="e.g. Expert" /></FormField>
            <FormField label="Code" required><Input {...profForm.register("code", { required: true })} placeholder="e.g. L4" /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Sort Order" required><Input {...profForm.register("sortOrder", { required: true })} type="number" placeholder="1" /></FormField>
            <FormField label="Score Multiplier" required hint="e.g. 1.5 = 1.5×"><Input {...profForm.register("scoreMultiplier", { required: true })} type="number" step="0.1" placeholder="1.0" /></FormField>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setProfModal({ open: false })}>Cancel</Button>
            <Button type="submit">{profModal.item ? "Save" : "Create"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// TAB 4 — QUALIFICATIONS
// ══════════════════════════════════════════════════════════════════

function QualificationsTab() {
  const { data: quals = [] } = useQualificationsConfig();
  const createQual = useCreateQual();
  const updateQual = useUpdateQual();

  type QF = { name: string; code: string; scoreContribution: string; sortOrder: string };
  const [modal, setModal] = useState<{ open: boolean; item?: QualType }>({ open: false });
  const form = useForm<QF>();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [scoreTier, setScoreTier] = useState("all");

  const filtered = (quals as unknown as QualType[])
    .filter((q) => { const s = search.toLowerCase(); return !s || q.name.toLowerCase().includes(s) || q.code.toLowerCase().includes(s); })
    .filter((q) => status === "all" || (status === "active" ? q.isActive : !q.isActive))
    .filter((q) => scoreTier === "all" ||
      (scoreTier === "low"    ? q.scoreContribution < 20 :
       scoreTier === "medium" ? q.scoreContribution >= 20 && q.scoreContribution < 50 :
       q.scoreContribution >= 50));

  const tc   = useTableControls(filtered as unknown as Record<string, unknown>[], { defaultSortKey: "sortOrder", pageSize: 8 });
  const rows = tc.rows as unknown as QualType[];

  const onSubmit = form.handleSubmit((v) => {
    const p = { name: v.name, code: v.code.toUpperCase(), scoreContribution: parseFloat(v.scoreContribution), sortOrder: parseInt(v.sortOrder) || 0 };
    const mut = modal.item ? updateQual.mutateAsync({ id: modal.item.id, ...p }) : createQual.mutateAsync(p);
    mut.then(() => { toast.success("Qualification saved"); setModal({ open: false }); }).catch((e: unknown) => toast.error(errMsg(e, "Failed")));
  });

  const toggle = (q: QualType) =>
    updateQual.mutateAsync({ id: q.id, isActive: !q.isActive }).then(() => toast.success("Updated")).catch((e: unknown) => toast.error(errMsg(e, "Failed")));

  return (
    <div>
      <TabToolbar
        title="Qualification Types" desc="Education levels and their BPV score contributions"
        addLabel="Add qualification type"
        onAdd={() => { form.reset({ name: "", code: "", scoreContribution: "", sortOrder: "" }); setModal({ open: true }); }}
        searchValue={search} onSearchChange={setSearch}
        filterGroups={[
          { label: "Status", value: status, onChange: setStatus, options: STATUS_OPTIONS },
          { label: "BPV Score Tier", value: scoreTier, onChange: setScoreTier, options: [
            { value: "all",    label: "Any score" },
            { value: "low",    label: "Low (< 20 pts)" },
            { value: "medium", label: "Medium (20–50 pts)" },
            { value: "high",   label: "High (≥ 50 pts)" },
          ]},
        ]}
      />
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <SortableHeader sort={tc.sort} onSort={tc.toggleSort} cols={[
              { label: "Name", sortKey: "name" }, { label: "Code", sortKey: "code" },
              { label: "BPV Score", sortKey: "scoreContribution" }, { label: "Sort Order", sortKey: "sortOrder" },
              { label: "Status", sortKey: "isActive" }, { label: "" },
            ]} />
            <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
              {rows.length === 0 && <EmptyRow cols={6} message={search ? "No results" : "No items yet"} />}
              {rows.map((q) => (
                <tr key={q.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/30">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{q.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-slate-400">{q.code}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-900/25 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700">
                      {q.scoreContribution} pts
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-slate-400">{q.sortOrder}</td>
                  <td className="px-4 py-3"><ActiveBadge active={q.isActive} /></td>
                  <td className="px-4 py-3">
                    <RowActions
                      onEdit={() => { form.reset({ name: q.name, code: q.code, scoreContribution: String(q.scoreContribution), sortOrder: String(q.sortOrder) }); setModal({ open: true, item: q }); }}
                      isActive={q.isActive} onToggle={() => toggle(q)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <TableFooter {...tc} onPageChange={tc.setPage} />
      </Card>

      <Modal open={modal.open} onClose={() => setModal({ open: false })} title={modal.item ? "Edit Qualification Type" : "Add Qualification Type"}>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <FormField label="Name" required><Input {...form.register("name", { required: true })} placeholder="e.g. Bachelor's Degree" /></FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Code" required><Input {...form.register("code", { required: true })} placeholder="e.g. BSC" /></FormField>
            <FormField label="Sort Order"><Input {...form.register("sortOrder")} type="number" placeholder="0" /></FormField>
          </div>
          <FormField label="BPV Score Contribution" required hint="Points added to BPV (0–100)">
            <Input {...form.register("scoreContribution", { required: true })} type="number" step="0.1" placeholder="e.g. 30" />
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModal({ open: false })}>Cancel</Button>
            <Button type="submit">{modal.item ? "Save" : "Create"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// TAB 5 — CERTIFICATIONS
// ══════════════════════════════════════════════════════════════════

function CertificationsTab() {
  const { data: certs = [] } = useCertificationsConfig();
  const createCert = useCreateCert();
  const updateCert = useUpdateCert();

  type CF = { name: string; code: string; issuingBody: string; scoreContribution: string; hasExpiry: string; expiryAlertDays: string };
  const [modal, setModal] = useState<{ open: boolean; item?: Certification }>({ open: false });
  const form = useForm<CF>();

  const [search, setSearch]       = useState("");
  const [status, setStatus]       = useState("all");
  const [expiry, setExpiry]       = useState("all");

  // Collect unique issuing bodies for filter
  const allBodies = Array.from(new Set((certs as unknown as Certification[]).map((c) => c.issuingBody).filter(Boolean)));
  const [body, setBody] = useState("all");
  const bodyOptions: FilterOption[] = [
    { value: "all", label: "All providers" },
    ...allBodies.map((b) => ({ value: b, label: b })),
  ];

  const filtered = (certs as unknown as Certification[])
    .filter((c) => { const q = search.toLowerCase(); return !q || c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || c.issuingBody.toLowerCase().includes(q); })
    .filter((c) => status === "all" || (status === "active" ? c.isActive : !c.isActive))
    .filter((c) => expiry === "all" || (expiry === "expires" ? c.hasExpiry : !c.hasExpiry))
    .filter((c) => body === "all" || c.issuingBody === body);

  const tc   = useTableControls(filtered as unknown as Record<string, unknown>[], { defaultSortKey: "name", pageSize: 8 });
  const rows = tc.rows as unknown as Certification[];

  const onSubmit = form.handleSubmit((v) => {
    const p = { name: v.name, code: v.code.toUpperCase(), issuingBody: v.issuingBody, scoreContribution: parseFloat(v.scoreContribution), hasExpiry: v.hasExpiry === "true", expiryAlertDays: parseInt(v.expiryAlertDays) || 60 };
    const mut = modal.item ? updateCert.mutateAsync({ id: modal.item.id, ...p }) : createCert.mutateAsync(p);
    mut.then(() => { toast.success("Certification saved"); setModal({ open: false }); }).catch((e: unknown) => toast.error(errMsg(e, "Failed")));
  });

  const toggle = (c: Certification) =>
    updateCert.mutateAsync({ id: c.id, isActive: !c.isActive }).then(() => toast.success("Updated")).catch((e: unknown) => toast.error(errMsg(e, "Failed")));

  return (
    <div>
      <TabToolbar
        title="Certifications" desc="Professional certifications and their BPV score contributions"
        addLabel="Add certification"
        onAdd={() => { form.reset({ name: "", code: "", issuingBody: "", scoreContribution: "", hasExpiry: "true", expiryAlertDays: "60" }); setModal({ open: true }); }}
        searchValue={search} onSearchChange={setSearch}
        filterGroups={[
          { label: "Status", value: status, onChange: setStatus, options: STATUS_OPTIONS },
          { label: "Expiry", value: expiry, onChange: setExpiry, options: [
            { value: "all",      label: "Any" },
            { value: "expires",  label: "Has expiry" },
            { value: "lifetime", label: "Lifetime only" },
          ]},
          ...(allBodies.length > 1 ? [{ label: "Provider", value: body, onChange: setBody, options: bodyOptions }] : []),
        ]}
      />
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <SortableHeader sort={tc.sort} onSort={tc.toggleSort} cols={[
              { label: "Name", sortKey: "name" }, { label: "Code", sortKey: "code" },
              { label: "Issuing Body", sortKey: "issuingBody" }, { label: "BPV Score", sortKey: "scoreContribution" },
              { label: "Expiry", sortKey: "hasExpiry" }, { label: "Status", sortKey: "isActive" }, { label: "" },
            ]} />
            <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
              {rows.length === 0 && <EmptyRow cols={7} message={search ? "No results" : "No items yet"} />}
              {rows.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/30">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{c.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-slate-400">{c.code}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-violet-50 dark:bg-violet-900/25 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-700">{c.issuingBody}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-900/25 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700">{c.scoreContribution} pts</span>
                  </td>
                  <td className="px-4 py-3">{c.hasExpiry ? <Badge variant="warning">Expires</Badge> : <Badge variant="secondary">Lifetime</Badge>}</td>
                  <td className="px-4 py-3"><ActiveBadge active={c.isActive} /></td>
                  <td className="px-4 py-3">
                    <RowActions
                      onEdit={() => { form.reset({ name: c.name, code: c.code, issuingBody: c.issuingBody, scoreContribution: String(c.scoreContribution), hasExpiry: String(c.hasExpiry), expiryAlertDays: String(c.expiryAlertDays) }); setModal({ open: true, item: c }); }}
                      isActive={c.isActive} onToggle={() => toggle(c)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <TableFooter {...tc} onPageChange={tc.setPage} />
      </Card>

      <Modal open={modal.open} onClose={() => setModal({ open: false })} title={modal.item ? "Edit Certification" : "Add Certification"} size="lg">
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <FormField label="Name" required><Input {...form.register("name", { required: true })} placeholder="e.g. AWS Certified Solutions Architect" /></FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Code" required><Input {...form.register("code", { required: true })} placeholder="e.g. AWS-CSA" /></FormField>
            <FormField label="Issuing Body" required><Input {...form.register("issuingBody", { required: true })} placeholder="e.g. Amazon Web Services" /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="BPV Score" required hint="0–100"><Input {...form.register("scoreContribution", { required: true })} type="number" step="0.1" placeholder="e.g. 20" /></FormField>
            <FormField label="Has Expiry"><Select {...form.register("hasExpiry")} options={[{ value: "true", label: "Yes — expires" }, { value: "false", label: "No — lifetime" }]} /></FormField>
          </div>
          <FormField label="Expiry Alert (days before)" hint="Alert HR this many days before expiry"><Input {...form.register("expiryAlertDays")} type="number" placeholder="60" /></FormField>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModal({ open: false })}>Cancel</Button>
            <Button type="submit">{modal.item ? "Save" : "Create"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// TAB 6 — BPV CONFIGURATION
// ══════════════════════════════════════════════════════════════════

function BpvConfigTab() {
  const { data: configs = [] } = useBpvConfig();
  const { data: bands  = [] } = useExpBandsConfig();
  const createConfig = useCreateBpvConfig();
  const createBand   = useCreateExpBand();
  const updateBand   = useUpdateExpBand();
  const { user }     = useAuth();
  const active = configs.find((c) => c.isActive);

  type WF = { educationPct: string; experiencePct: string; orgProfilePct: string; skillsPct: string; certsPct: string; effectiveFrom: string; changeReason: string };
  type BF = { yearsFrom: string; yearsTo: string; scorePoints: string };

  const [wModal, setWModal] = useState(false);
  const [bModal, setBModal] = useState<{ open: boolean; item?: ExpBand }>({ open: false });
  const wForm = useForm<WF>();
  const bForm = useForm<BF>();

  const [bandSearch, setBandSearch] = useState("");
  const [bandStatus, setBandStatus] = useState("all");

  const filteredBands = (bands as unknown as ExpBand[])
    .filter((b) => bandStatus === "all" || (bandStatus === "active" ? b.isActive : !b.isActive));

  const configTc = useTableControls(configs as unknown as Record<string, unknown>[], { defaultSortKey: "effectiveFrom", defaultDir: "desc", pageSize: 5 });
  const bandTc   = useTableControls(filteredBands as unknown as Record<string, unknown>[], { defaultSortKey: "yearsFrom", pageSize: 8 });

  const onWeights = wForm.handleSubmit((v) => {
    const pcts = [v.educationPct, v.experiencePct, v.orgProfilePct, v.skillsPct, v.certsPct].map(parseFloat);
    const sum = pcts.reduce((a, b) => a + b, 0);
    if (Math.abs(sum - 100) > 0.01) { toast.error(`Percentages must sum to 100 (currently ${sum.toFixed(1)})`); return; }
    const p = { educationPct: pcts[0], experiencePct: pcts[1], orgProfilePct: pcts[2], skillsPct: pcts[3], certsPct: pcts[4], effectiveFrom: v.effectiveFrom, changeReason: v.changeReason, createdBy: user?.employeeId ?? "admin" };
    createConfig.mutateAsync(p).then(() => { toast.success("BPV weights updated — new version activated"); setWModal(false); }).catch((e: unknown) => toast.error(errMsg(e, "Failed")));
  });

  const onBand = bForm.handleSubmit((v) => {
    const p = { yearsFrom: parseFloat(v.yearsFrom), yearsTo: parseFloat(v.yearsTo), scorePoints: parseFloat(v.scorePoints) };
    const mut = bModal.item ? updateBand.mutateAsync({ id: bModal.item.id, ...p }) : createBand.mutateAsync(p);
    mut.then(() => { toast.success("Band saved"); setBModal({ open: false }); }).catch((e: unknown) => toast.error(errMsg(e, "Failed")));
  });

  const configRows = configTc.rows as unknown as typeof configs;
  const bandRows   = bandTc.rows   as unknown as ExpBand[];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="flex items-start justify-between mb-4 gap-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">BPV Weight Configuration</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">All weights must sum to 100%.</p>
          </div>
          <Tooltip label="Create new BPV weight version">
            <button onClick={() => { wForm.reset({ educationPct: "20", experiencePct: "30", orgProfilePct: "15", skillsPct: "25", certsPct: "10", effectiveFrom: new Date().toISOString().split("T")[0], changeReason: "" }); setWModal(true); }}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white transition-all duration-150 active:scale-95 shadow-sm shadow-primary-600/20">
              <Plus className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>

        {active ? (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
            {[{ label: "Education", val: active.educationPct }, { label: "Experience", val: active.experiencePct }, { label: "Org Profile", val: active.orgProfilePct }, { label: "Skills", val: active.skillsPct }, { label: "Certs", val: active.certsPct }].map((x) => (
              <Card key={x.label} className="text-center">
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{x.val}%</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{x.label}</p>
              </Card>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-sm text-gray-500 dark:text-slate-400 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 mb-4">
            No active BPV weight configuration. Create one to enable BPV scoring.
          </div>
        )}

        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <SortableHeader sort={configTc.sort} onSort={configTc.toggleSort} cols={[
                { label: "Effective", sortKey: "effectiveFrom" }, { label: "Edu %", sortKey: "educationPct" },
                { label: "Exp %", sortKey: "experiencePct" }, { label: "Org %", sortKey: "orgProfilePct" },
                { label: "Skills %", sortKey: "skillsPct" }, { label: "Certs %", sortKey: "certsPct" },
                { label: "Reason" }, { label: "Status", sortKey: "isActive" },
              ]} />
              <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
                {configRows.length === 0 && <EmptyRow cols={8} />}
                {configRows.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/30">
                    <td className="px-4 py-3 text-gray-700 dark:text-slate-300">{new Date(c.effectiveFrom).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-slate-400">{c.educationPct}%</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-slate-400">{c.experiencePct}%</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-slate-400">{c.orgProfilePct}%</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-slate-400">{c.skillsPct}%</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-slate-400">{c.certsPct}%</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-slate-400 max-w-xs truncate">{c.changeReason}</td>
                    <td className="px-4 py-3"><ActiveBadge active={c.isActive} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <TableFooter {...configTc} onPageChange={configTc.setPage} />
        </Card>
      </div>

      <div>
        <TabToolbar
          title="Experience Bands" desc="Score points awarded per years-of-experience bracket"
          addLabel="Add experience band"
          onAdd={() => { bForm.reset({ yearsFrom: "", yearsTo: "", scorePoints: "" }); setBModal({ open: true }); }}
          searchValue={bandSearch} onSearchChange={setBandSearch}
          filterGroups={[{ label: "Status", value: bandStatus, onChange: setBandStatus, options: STATUS_OPTIONS }]}
        />
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <SortableHeader sort={bandTc.sort} onSort={bandTc.toggleSort} cols={[
                { label: "Years From", sortKey: "yearsFrom" }, { label: "Years To", sortKey: "yearsTo" },
                { label: "Score Points", sortKey: "scorePoints" }, { label: "Status", sortKey: "isActive" }, { label: "" },
              ]} />
              <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
                {bandRows.length === 0 && <EmptyRow cols={5} />}
                {bandRows.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/30">
                    <td className="px-4 py-3 text-gray-700 dark:text-slate-300">{b.yearsFrom} yrs</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-slate-300">{b.yearsTo} yrs</td>
                    <td className="px-4 py-3 font-semibold text-primary-600 dark:text-primary-400">{b.scorePoints} pts</td>
                    <td className="px-4 py-3"><ActiveBadge active={b.isActive} /></td>
                    <td className="px-4 py-3">
                      <RowActions
                        onEdit={() => { bForm.reset({ yearsFrom: String(b.yearsFrom), yearsTo: String(b.yearsTo), scorePoints: String(b.scorePoints) }); setBModal({ open: true, item: b }); }}
                        isActive={b.isActive} onToggle={() => updateBand.mutateAsync({ id: b.id, isActive: !b.isActive }).then(() => toast.success("Updated")).catch((e: unknown) => toast.error(errMsg(e, "Failed")))}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <TableFooter {...bandTc} onPageChange={bandTc.setPage} />
        </Card>
      </div>

      <Modal open={wModal} onClose={() => setWModal(false)} title="New BPV Weight Configuration" description="Creating a new version deactivates the current one." size="lg">
        <form onSubmit={onWeights} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[{ label: "Education %", field: "educationPct" as const }, { label: "Experience %", field: "experiencePct" as const }, { label: "Org Profile %", field: "orgProfilePct" as const }, { label: "Skills %", field: "skillsPct" as const }, { label: "Certs %", field: "certsPct" as const }].map(({ label, field }) => (
              <FormField key={field} label={label} required hint="0–100"><Input {...wForm.register(field, { required: true })} type="number" step="0.1" placeholder="0" /></FormField>
            ))}
          </div>
          <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg">All five percentages must sum to exactly 100.</p>
          <FormField label="Effective From" required><Input {...wForm.register("effectiveFrom", { required: true })} type="date" /></FormField>
          <FormField label="Reason for Change" required><Input {...wForm.register("changeReason", { required: true })} placeholder="e.g. Annual review — increased skills weighting" /></FormField>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setWModal(false)}>Cancel</Button>
            <Button type="submit">Activate New Weights</Button>
          </div>
        </form>
      </Modal>
      <Modal open={bModal.open} onClose={() => setBModal({ open: false })} title={bModal.item ? "Edit Experience Band" : "Add Experience Band"}>
        <form onSubmit={onBand} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Years From" required><Input {...bForm.register("yearsFrom", { required: true })} type="number" step="0.5" placeholder="0" /></FormField>
            <FormField label="Years To" required><Input {...bForm.register("yearsTo", { required: true })} type="number" step="0.5" placeholder="3" /></FormField>
          </div>
          <FormField label="Score Points" required hint="0–100"><Input {...bForm.register("scorePoints", { required: true })} type="number" step="0.5" placeholder="e.g. 25" /></FormField>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setBModal({ open: false })}>Cancel</Button>
            <Button type="submit">{bModal.item ? "Save" : "Create"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// TAB 7 — EXPERIENCE TYPES
// ══════════════════════════════════════════════════════════════════

function ExperienceTypesTab() {
  const { data: expTypes = [] } = useExpTypesConfig();
  const createExp = useCreateExpType();
  const updateExp = useUpdateExpType();

  type EF = { name: string; code: string };
  const [modal, setModal] = useState<{ open: boolean; item?: ExpType }>({ open: false });
  const form = useForm<EF>();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const filtered = (expTypes as unknown as ExpType[])
    .filter((e) => { const q = search.toLowerCase(); return !q || e.name.toLowerCase().includes(q) || e.code.toLowerCase().includes(q); })
    .filter((e) => status === "all" || (status === "active" ? e.isActive : !e.isActive));

  const tc   = useTableControls(filtered as unknown as Record<string, unknown>[], { defaultSortKey: "name", pageSize: 8 });
  const rows = tc.rows as unknown as ExpType[];

  const onSubmit = form.handleSubmit((v) => {
    const p = { name: v.name, code: v.code.toUpperCase() };
    const mut = modal.item ? updateExp.mutateAsync({ id: modal.item.id, ...p }) : createExp.mutateAsync(p);
    mut.then(() => { toast.success("Saved"); setModal({ open: false }); }).catch((e: unknown) => toast.error(errMsg(e, "Failed")));
  });

  const toggle = (e: ExpType) =>
    updateExp.mutateAsync({ id: e.id, isActive: !e.isActive }).then(() => toast.success("Updated")).catch((e2: unknown) => toast.error(errMsg(e2, "Failed")));

  return (
    <div>
      <TabToolbar
        title="Experience Types" desc="Types of work experience (e.g. Full-Time, Freelance, Contract)"
        addLabel="Add experience type"
        onAdd={() => { form.reset({ name: "", code: "" }); setModal({ open: true }); }}
        searchValue={search} onSearchChange={setSearch}
        filterGroups={[{ label: "Status", value: status, onChange: setStatus, options: STATUS_OPTIONS }]}
      />
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <SortableHeader sort={tc.sort} onSort={tc.toggleSort} cols={[
              { label: "Name", sortKey: "name" }, { label: "Code", sortKey: "code" },
              { label: "Status", sortKey: "isActive" }, { label: "" },
            ]} />
            <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
              {rows.length === 0 && <EmptyRow cols={4} message={search ? "No results" : "No items yet"} />}
              {rows.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/30">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{e.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-slate-400">{e.code}</td>
                  <td className="px-4 py-3"><ActiveBadge active={e.isActive} /></td>
                  <td className="px-4 py-3">
                    <RowActions onEdit={() => { form.reset({ name: e.name, code: e.code }); setModal({ open: true, item: e }); }} isActive={e.isActive} onToggle={() => toggle(e)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <TableFooter {...tc} onPageChange={tc.setPage} />
      </Card>

      <Modal open={modal.open} onClose={() => setModal({ open: false })} title={modal.item ? "Edit Experience Type" : "Add Experience Type"}>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <FormField label="Name" required><Input {...form.register("name", { required: true })} placeholder="e.g. Full-Time" /></FormField>
          <FormField label="Code" required><Input {...form.register("code", { required: true })} placeholder="e.g. FT" /></FormField>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModal({ open: false })}>Cancel</Button>
            <Button type="submit">{modal.item ? "Save" : "Create"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// TAB 8 — ORGANISATION TYPES
// ══════════════════════════════════════════════════════════════════

function OrgTypesTab() {
  const { data: orgTypes = [] } = useOrgTypesConfig();
  const createOrg = useCreateOrgType();
  const updateOrg = useUpdateOrgType();

  type OF = { name: string; code: string; scoreContribution: string };
  const [modal, setModal] = useState<{ open: boolean; item?: OrgType }>({ open: false });
  const form = useForm<OF>();

  const [search, setSearch]     = useState("");
  const [status, setStatus]     = useState("all");
  const [multiplier, setMultiplier] = useState("all");

  const filtered = (orgTypes as unknown as OrgType[])
    .filter((o) => { const q = search.toLowerCase(); return !q || o.name.toLowerCase().includes(q) || o.code.toLowerCase().includes(q); })
    .filter((o) => status === "all" || (status === "active" ? o.isActive : !o.isActive))
    .filter((o) => multiplier === "all" || (multiplier === "low" ? o.scoreContribution < 0.7 : o.scoreContribution >= 0.7));

  const tc   = useTableControls(filtered as unknown as Record<string, unknown>[], { defaultSortKey: "name", pageSize: 8 });
  const rows = tc.rows as unknown as OrgType[];

  const onSubmit = form.handleSubmit((v) => {
    const p = { name: v.name, code: v.code.toUpperCase(), scoreContribution: parseFloat(v.scoreContribution) };
    const mut = modal.item ? updateOrg.mutateAsync({ id: modal.item.id, ...p }) : createOrg.mutateAsync(p);
    mut.then(() => { toast.success("Saved"); setModal({ open: false }); }).catch((e: unknown) => toast.error(errMsg(e, "Failed")));
  });

  const toggle = (o: OrgType) =>
    updateOrg.mutateAsync({ id: o.id, isActive: !o.isActive }).then(() => toast.success("Updated")).catch((e: unknown) => toast.error(errMsg(e, "Failed")));

  return (
    <div>
      <TabToolbar
        title="Organisation Types" desc="Organisation tiers used to weight experience scoring (0.0–1.0 multiplier)"
        addLabel="Add organisation type"
        onAdd={() => { form.reset({ name: "", code: "", scoreContribution: "" }); setModal({ open: true }); }}
        searchValue={search} onSearchChange={setSearch}
        filterGroups={[
          { label: "Status", value: status, onChange: setStatus, options: STATUS_OPTIONS },
          { label: "Multiplier Tier", value: multiplier, onChange: setMultiplier, options: [
            { value: "all",  label: "Any multiplier" },
            { value: "low",  label: "Standard (< 0.7)" },
            { value: "high", label: "Premium (≥ 0.7)" },
          ]},
        ]}
      />
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <SortableHeader sort={tc.sort} onSort={tc.toggleSort} cols={[
              { label: "Name", sortKey: "name" }, { label: "Code", sortKey: "code" },
              { label: "Multiplier", sortKey: "scoreContribution" }, { label: "Status", sortKey: "isActive" }, { label: "" },
            ]} />
            <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
              {rows.length === 0 && <EmptyRow cols={5} message={search ? "No results" : "No items yet"} />}
              {rows.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/30">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{o.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-slate-400">{o.code}</td>
                  <td className="px-4 py-3 font-semibold text-primary-600 dark:text-primary-400">{o.scoreContribution}</td>
                  <td className="px-4 py-3"><ActiveBadge active={o.isActive} /></td>
                  <td className="px-4 py-3">
                    <RowActions onEdit={() => { form.reset({ name: o.name, code: o.code, scoreContribution: String(o.scoreContribution) }); setModal({ open: true, item: o }); }} isActive={o.isActive} onToggle={() => toggle(o)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <TableFooter {...tc} onPageChange={tc.setPage} />
      </Card>

      <Modal open={modal.open} onClose={() => setModal({ open: false })} title={modal.item ? "Edit Organisation Type" : "Add Organisation Type"}>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <FormField label="Name" required><Input {...form.register("name", { required: true })} placeholder="e.g. MNC" /></FormField>
          <FormField label="Code" required><Input {...form.register("code", { required: true })} placeholder="e.g. MNC" /></FormField>
          <FormField label="Score Multiplier" required hint="0.0 to 1.0 (e.g. 0.9 = 90%)"><Input {...form.register("scoreContribution", { required: true })} type="number" step="0.01" min="0" max="1" placeholder="e.g. 0.8" /></FormField>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModal({ open: false })}>Cancel</Button>
            <Button type="submit">{modal.item ? "Save" : "Create"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════

const TABS = [
  { id: "departments",    label: "Departments",    icon: <Building2     className="w-4 h-4" /> },
  { id: "designations",   label: "Designations",   icon: <Briefcase     className="w-4 h-4" /> },
  { id: "skills",         label: "Skills",         icon: <Star          className="w-4 h-4" /> },
  { id: "qualifications", label: "Qualifications", icon: <GraduationCap className="w-4 h-4" /> },
  { id: "certifications", label: "Certifications", icon: <Award         className="w-4 h-4" /> },
  { id: "bpv",            label: "BPV Config",     icon: <TrendingUp    className="w-4 h-4" /> },
  { id: "exp-types",      label: "Exp Types",      icon: <Briefcase     className="w-4 h-4" /> },
  { id: "org-types",      label: "Org Types",      icon: <Network       className="w-4 h-4" /> },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("departments");

  return (
    <RoleGuard require="nav:config" redirectTo="/dashboard">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary-50 dark:bg-primary-900/30 rounded-xl">
              <Settings2 className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configuration</h1>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Manage master data — departments, skills, qualifications, and BPV scoring rules</p>
            </div>
          </div>
          <BackButton href="/dashboard" label="Back to Dashboard" />
        </div>

        <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

        <div className="min-h-0">
          {activeTab === "departments"    && <DepartmentsTab />}
          {activeTab === "designations"   && <DesignationsTab />}
          {activeTab === "skills"         && <SkillsTab />}
          {activeTab === "qualifications" && <QualificationsTab />}
          {activeTab === "certifications" && <CertificationsTab />}
          {activeTab === "bpv"            && <BpvConfigTab />}
          {activeTab === "exp-types"      && <ExperienceTypesTab />}
          {activeTab === "org-types"      && <OrgTypesTab />}
        </div>
      </div>
    </RoleGuard>
  );
}
