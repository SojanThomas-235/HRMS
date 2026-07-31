"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  Pencil, GraduationCap, Briefcase, Star, Award, TrendingUp,
  Plus, Trash2, Mail, Phone, CalendarDays, User, Search, X,
} from "lucide-react";
import {
  Button, Badge, Breadcrumb, BackButton, Avatar, Tabs, Card, CardHeader, CardTitle,
  CardDivider, EmptyState, Modal, FormField, Input, Select, SkeletonCard, Tooltip,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import {
  useEmployee, useBpvHistory,
  useAddQualification, useDeleteQualification, useUpdateQualification,
  useAddExperience, useDeleteExperience, useUpdateExperience,
  useAddSkill, useDeleteSkill, useUpdateSkill,
  useAddCertification, useDeleteCertification, useUpdateCertification,
  type EmployeeDetail, type Qualification, type Experience, type Skill, type Certification,
} from "@/hooks/employee/useEmployee";
import {
  useQualTypes, useProficiencyLevels, useSkills,
  useCertifications, useExpTypes, useOrgTypes,
} from "@/hooks/useMasters";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { usePermissions } from "@/hooks/usePermissions";

const iconBtn = "p-2 rounded-xl text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all duration-150 active:scale-95";
const iconBtnDanger = "p-2 rounded-xl text-gray-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-150 active:scale-95";

const statusVariant = (s: string) =>
  s === "ACTIVE" ? "success" : s === "ON_NOTICE" ? "warning" : "danger";

function toInputDate(d?: string | null) {
  if (!d) return "";
  return new Date(d).toISOString().split("T")[0];
}

export default function EmployeeDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();

  const { can, isSelf, role } = usePermissions();
  const { data: emp, isLoading } = useEmployee(id);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (role === "EMPLOYEE" && !isSelf(id)) {
      router.replace(`/employees/${id}`);
    }
  }, [role, id, isSelf, router]);

  if (isLoading) return <DetailSkeleton />;
  if (!emp) return (
    <EmptyState
      title="Employee not found"
      description="This employee may have been deleted."
      action={{ label: "Back to employees", onClick: () => router.push("/employees") }}
    />
  );

  const canEditProfile = can("employee:edit");
  const canManageSubs  = can("employee:sub:manage") || (can("employee:sub:self") && isSelf(id));

  const tabs = [
    { id: "overview",       label: "Overview",       count: undefined },
    { id: "qualifications", label: "Qualifications",  count: emp.qualifications.length },
    { id: "experience",     label: "Experience",      count: emp.experiences.length },
    { id: "skills",         label: "Skills",          count: emp.skills.length },
    { id: "certifications", label: "Certifications",  count: emp.certifications.length },
    { id: "bpv",            label: "BPV History",     count: undefined },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Breadcrumb items={[
          { label: "Employees", href: "/employees" },
          { label: emp.fullName },
        ]} />
        <BackButton href="/employees" label="Back to Employees" />
      </div>

      {/* Header card */}
      <div className="bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl backdrop-saturate-150 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <Avatar name={emp.fullName} size="lg" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-sage-600 dark:text-white">{emp.fullName}</h1>
                <Badge variant={statusVariant(emp.status)} dot>
                  {emp.status === "ON_NOTICE" ? "On Notice" : emp.status.charAt(0) + emp.status.slice(1).toLowerCase()}
                </Badge>
              </div>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                {emp.designation.title} · {emp.department.name}
              </p>
              <p className="text-xs font-mono text-gray-400 dark:text-slate-500 mt-0.5">{emp.employeeCode}</p>
            </div>
          </div>
          {canEditProfile && (
            <Tooltip label="Edit employee profile">
              <button
                onClick={() => router.push(`/employees/${id}/edit`)}
                className={iconBtn}
              >
                <Pencil className="w-4 h-4" />
              </button>
            </Tooltip>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-gray-100 dark:border-slate-700">
          <InfoItem icon={<Mail className="w-4 h-4" />} label="Email" value={emp.email} />
          <InfoItem icon={<Phone className="w-4 h-4" />} label="Phone" value={emp.phone ?? "—"} />
          <InfoItem icon={<CalendarDays className="w-4 h-4" />} label="Joined" value={fmtDate(emp.dateOfJoining)} />
          <InfoItem
            icon={<TrendingUp className="w-4 h-4" />}
            label="Latest BPV"
            value={emp.bpvScores[0]?.score != null ? `${emp.bpvScores[0].score.toFixed(1)} / 100` : "Not calculated"}
          />
        </div>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "overview"       && <OverviewTab emp={emp} />}
      {activeTab === "qualifications" && <QualTab  id={id} emp={emp} canWrite={canManageSubs} />}
      {activeTab === "experience"     && <ExpTab   id={id} emp={emp} canWrite={canManageSubs} />}
      {activeTab === "skills"         && <SkillTab id={id} emp={emp} canWrite={canManageSubs} />}
      {activeTab === "certifications" && <CertTab  id={id} emp={emp} canWrite={canManageSubs} />}
      {activeTab === "bpv"            && <BpvTab   id={id} />}
    </div>
  );
}

// ── Overview ─────────────────────────────────────────────────────────────────

function OverviewTab({ emp }: { emp: EmployeeDetail }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      <Card padding="none">
        <CardHeader className="p-5 pb-0"><CardTitle icon={<User className="w-4 h-4" />}>Personal Details</CardTitle></CardHeader>
        <div className="p-5 grid grid-cols-2 gap-3">
          <Detail label="Date of Birth"    value={emp.dateOfBirth ? fmtDate(emp.dateOfBirth) : "—"} />
          <Detail label="Date of Joining"  value={fmtDate(emp.dateOfJoining)} />
          <Detail label="Department"       value={emp.department.name} />
          <Detail label="Designation"      value={emp.designation.title} />
          {emp.designation.grade && <Detail label="Grade" value={emp.designation.grade} />}
          <Detail label="Manager"          value={emp.manager?.fullName ?? "—"} />
        </div>
      </Card>
      <Card padding="none">
        <CardHeader className="p-5 pb-0"><CardTitle icon={<TrendingUp className="w-4 h-4" />}>Latest BPV Breakdown</CardTitle></CardHeader>
        <div className="p-5">
          {emp.bpvScores[0] ? (
            <div className="space-y-3">
              <BpvBar label="Education"   value={emp.bpvScores[0].educationScore} max={100} color="blue" />
              <BpvBar label="Experience"  value={emp.bpvScores[0].experienceScore} max={100} color="emerald" />
              <BpvBar label="Org Profile" value={emp.bpvScores[0].orgScore}        max={100} color="purple" />
              <BpvBar label="Skills"      value={emp.bpvScores[0].skillScore}      max={100} color="amber" />
              <BpvBar label="Certs"       value={emp.bpvScores[0].certScore}       max={100} color="rose" />
              <CardDivider />
              <div className="flex justify-between items-center font-semibold">
                <span className="text-gray-700 dark:text-slate-300">Total BPV</span>
                <span className="text-lg text-sage-600 dark:text-white">{emp.bpvScores[0].score.toFixed(1)}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-slate-400">BPV not yet calculated.</p>
          )}
        </div>
      </Card>
    </div>
  );
}

// ── Qualifications ────────────────────────────────────────────────────────────

const qualSchema = z.object({
  qualificationTypeId: z.string().min(1, "Required"),
  institution:         z.string().min(2, "Required"),
  yearOfCompletion:    z.coerce.number().min(1950).max(new Date().getFullYear()),
  grade:               z.string().optional(),
});
const qualEditSchema = z.object({
  institution:      z.string().min(2, "Required"),
  yearOfCompletion: z.coerce.number().min(1950).max(new Date().getFullYear()),
  grade:            z.string().optional(),
});

function QualTab({ id, emp, canWrite }: { id: string; emp: EmployeeDetail; canWrite: boolean }) {
  const [open, setOpen]       = useState(false);
  const [editing, setEditing] = useState<Qualification | null>(null);
  const [search, setSearch]   = useState("");
  const keepOpenRef           = useRef(false);

  const addMut  = useAddQualification(id);
  const updMut  = useUpdateQualification(id);
  const delMut  = useDeleteQualification(id);
  const { data: types } = useQualTypes();

  const addForm = useForm<z.infer<typeof qualSchema>>({ resolver: zodResolver(qualSchema) });
  const editForm = useForm<z.infer<typeof qualEditSchema>>({ resolver: zodResolver(qualEditSchema) });

  const onAdd = (v: z.infer<typeof qualSchema>) => {
    addMut.mutate(v as Parameters<typeof addMut.mutate>[0], {
      onSuccess: () => {
        addForm.reset();
        if (!keepOpenRef.current) setOpen(false);
        keepOpenRef.current = false;
      },
    });
  };

  const onEdit = (v: z.infer<typeof qualEditSchema>) => {
    if (!editing) return;
    updMut.mutate({ id: editing.id, data: v }, { onSuccess: () => setEditing(null) });
  };

  useEffect(() => {
    if (editing) {
      editForm.reset({
        institution:      editing.institution,
        yearOfCompletion: editing.yearOfCompletion,
        grade:            editing.grade ?? "",
      });
    }
  }, [editing, editForm]);

  const q = search
    ? emp.qualifications.filter((q) =>
        q.institution.toLowerCase().includes(search.toLowerCase()) ||
        q.qualificationType.name.toLowerCase().includes(search.toLowerCase()))
    : emp.qualifications;

  return (
    <SubCard
      title="Qualifications" icon={<GraduationCap className="w-4 h-4" />}
      onAdd={canWrite ? () => setOpen(true) : undefined}
      search={search} onSearch={setSearch}
    >
      {q.length === 0 ? (
        <EmptyState title={search ? "No matches" : "No qualifications"} description={search ? "Try a different search." : "Add the employee's educational background."} />
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-slate-700 text-xs text-gray-500 dark:text-slate-400 uppercase">
              <Th>Type</Th><Th>Institution</Th><Th>Year</Th><Th>Grade</Th><Th>Status</Th><Th />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
            {q.map((qual) => (
              <tr key={qual.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                <Td>{qual.qualificationType.name}</Td>
                <Td>{qual.institution}</Td>
                <Td>{qual.yearOfCompletion}</Td>
                <Td>{qual.grade ?? "—"}</Td>
                <Td>
                  <Badge variant={qual.verificationStatus === "VERIFIED" ? "success" : "warning"}>
                    {qual.verificationStatus}
                  </Badge>
                </Td>
                <Td>
                  {canWrite && (
                    <div className="flex items-center gap-1 justify-end">
                      <Tooltip label="Edit qualification" side="left">
                        <button onClick={() => setEditing(qual)} className={iconBtn}>
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </Tooltip>
                      <Tooltip label="Remove qualification" side="left">
                        <button onClick={() => delMut.mutate(qual.id)} className={iconBtnDanger}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </Tooltip>
                    </div>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Add modal */}
      <Modal open={open} onClose={() => { setOpen(false); addForm.reset(); }} title="Add Qualification" size="md">
        <form onSubmit={addForm.handleSubmit(onAdd)} className="flex flex-col gap-4">
          <FormField label="Qualification Type" required error={addForm.formState.errors.qualificationTypeId?.message}>
            <Select {...addForm.register("qualificationTypeId")} options={[
              { value: "", label: "Select type" },
              ...(types?.map((t) => ({ value: t.id, label: t.name })) ?? []),
            ]} />
          </FormField>
          <FormField label="Institution" required error={addForm.formState.errors.institution?.message}>
            <Input {...addForm.register("institution")} placeholder="University / College name" />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Year of Completion" required error={addForm.formState.errors.yearOfCompletion?.message}>
              <Input {...addForm.register("yearOfCompletion")} type="number" placeholder="2020" />
            </FormField>
            <FormField label="Grade / CGPA" error={addForm.formState.errors.grade?.message}>
              <Input {...addForm.register("grade")} placeholder="e.g. First Class / 8.5" />
            </FormField>
          </div>
          <div className="flex justify-between pt-2">
            <Button variant="secondary" type="button" onClick={() => { keepOpenRef.current = true; addForm.handleSubmit(onAdd)(); }}>
              Save &amp; Add Another
            </Button>
            <div className="flex gap-3">
              <Button variant="secondary" type="button" onClick={() => { setOpen(false); addForm.reset(); }}>Cancel</Button>
              <Button type="submit" loading={addMut.isPending}>Add</Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Edit modal */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Qualification" size="md">
        <form onSubmit={editForm.handleSubmit(onEdit)} className="flex flex-col gap-4">
          <FormField label="Institution" required error={editForm.formState.errors.institution?.message}>
            <Input {...editForm.register("institution")} placeholder="University / College name" />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Year of Completion" required error={editForm.formState.errors.yearOfCompletion?.message}>
              <Input {...editForm.register("yearOfCompletion")} type="number" placeholder="2020" />
            </FormField>
            <FormField label="Grade / CGPA" error={editForm.formState.errors.grade?.message}>
              <Input {...editForm.register("grade")} placeholder="e.g. First Class / 8.5" />
            </FormField>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setEditing(null)}>Cancel</Button>
            <Button type="submit" loading={updMut.isPending}>Save Changes</Button>
          </div>
        </form>
      </Modal>
    </SubCard>
  );
}

// ── Experience ────────────────────────────────────────────────────────────────

const expSchema = z.object({
  organizationName:   z.string().min(2, "Required"),
  designationHeld:    z.string().min(2, "Required"),
  organizationTypeId: z.string().min(1, "Required"),
  startDate:          z.string().min(1, "Required"),
  endDate:            z.string().optional(),
  isCurrent:          z.boolean().default(false),
  experienceTypes:    z.array(z.string()).min(1, "Select at least one type"),
});

function ExpTab({ id, emp, canWrite }: { id: string; emp: EmployeeDetail; canWrite: boolean }) {
  const [open, setOpen]       = useState(false);
  const [editing, setEditing] = useState<Experience | null>(null);
  const [search, setSearch]   = useState("");
  const keepOpenRef           = useRef(false);

  const addMut = useAddExperience(id);
  const updMut = useUpdateExperience(id);
  const delMut = useDeleteExperience(id);
  const { data: orgTypes } = useOrgTypes();
  const { data: expTypes }  = useExpTypes();

  const addForm  = useForm<z.infer<typeof expSchema>>({ resolver: zodResolver(expSchema), defaultValues: { isCurrent: false, experienceTypes: [] } });
  const editForm = useForm<z.infer<typeof expSchema>>({ resolver: zodResolver(expSchema), defaultValues: { isCurrent: false, experienceTypes: [] } });
  const addIsCurrent  = addForm.watch("isCurrent");
  const editIsCurrent = editForm.watch("isCurrent");

  const buildPayload = (v: z.infer<typeof expSchema>) => ({
    ...v,
    endDate: v.isCurrent || !v.endDate ? undefined : v.endDate,
  });

  const onAdd = (v: z.infer<typeof expSchema>) => {
    addMut.mutate(buildPayload(v) as Parameters<typeof addMut.mutate>[0], {
      onSuccess: () => {
        addForm.reset({ isCurrent: false, experienceTypes: [] });
        if (!keepOpenRef.current) setOpen(false);
        keepOpenRef.current = false;
      },
    });
  };

  const onEdit = (v: z.infer<typeof expSchema>) => {
    if (!editing) return;
    updMut.mutate({ id: editing.id, data: buildPayload(v) }, { onSuccess: () => setEditing(null) });
  };

  useEffect(() => {
    if (editing) {
      editForm.reset({
        organizationName:   editing.organizationName,
        designationHeld:    editing.designationHeld,
        organizationTypeId: editing.organizationType.id,
        startDate:          toInputDate(editing.startDate),
        endDate:            toInputDate(editing.endDate),
        isCurrent:          editing.isCurrent,
        experienceTypes:    editing.experienceTypes.map((t) => t.experienceType.id),
      });
    }
  }, [editing, editForm]);

  const filtered = search
    ? emp.experiences.filter((e) =>
        e.organizationName.toLowerCase().includes(search.toLowerCase()) ||
        e.designationHeld.toLowerCase().includes(search.toLowerCase()))
    : emp.experiences;

  return (
    <SubCard
      title="Experience" icon={<Briefcase className="w-4 h-4" />}
      onAdd={canWrite ? () => setOpen(true) : undefined}
      search={search} onSearch={setSearch}
    >
      {filtered.length === 0 ? (
        <EmptyState title={search ? "No matches" : "No experience records"} description={search ? "Try a different search." : "Add previous employment details."} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-5">
          {filtered.map((ex) => (
            <div key={ex.id} className="p-4 rounded-lg bg-gray-50 dark:bg-slate-700/40 border border-gray-100 dark:border-slate-700">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-sage-600 dark:text-white truncate">{ex.organizationName}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">{ex.designationHeld} · {ex.organizationType.name}</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                    {fmtDate(ex.startDate)} → {ex.isCurrent ? "Present" : ex.endDate ? fmtDate(ex.endDate) : "—"}
                    {" "}· {ex.yearsCalculated.toFixed(1)} yrs
                  </p>
                  <div className="flex gap-1 mt-1.5 flex-wrap">
                    {ex.experienceTypes.map((t) => (
                      <Badge key={t.experienceType.id} variant="info">{t.experienceType.name}</Badge>
                    ))}
                  </div>
                </div>
                {canWrite && (
                  <div className="flex items-center gap-1 shrink-0">
                    <Tooltip label="Edit experience" side="left">
                      <button onClick={() => setEditing(ex)} className={iconBtn}>
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </Tooltip>
                    <Tooltip label="Remove experience" side="left">
                      <button onClick={() => delMut.mutate(ex.id)} className={iconBtnDanger}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </Tooltip>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => { setOpen(false); addForm.reset({ isCurrent: false, experienceTypes: [] }); }} title="Add Experience" size="md">
        <ExperienceForm
          form={addForm} isCurrent={addIsCurrent} onSubmit={onAdd}
          isPending={addMut.isPending} orgTypes={orgTypes} expTypes={expTypes}
          onCancel={() => { setOpen(false); addForm.reset({ isCurrent: false, experienceTypes: [] }); }}
          extraFooter={
            <Button variant="secondary" type="button" onClick={() => {
              keepOpenRef.current = true;
              addForm.handleSubmit(onAdd)();
            }}>Save &amp; Add Another</Button>
          }
        />
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Experience" size="md">
        <ExperienceForm
          form={editForm} isCurrent={editIsCurrent} onSubmit={onEdit}
          isPending={updMut.isPending} orgTypes={orgTypes} expTypes={expTypes}
          onCancel={() => setEditing(null)}
        />
      </Modal>
    </SubCard>
  );
}

// ── Skills ────────────────────────────────────────────────────────────────────

const skillSchema = z.object({
  skillId:            z.string().min(1, "Required"),
  proficiencyLevelId: z.string().min(1, "Required"),
  yearsOfExperience:  z.coerce.number().min(0),
});
const skillEditSchema = z.object({
  proficiencyLevelId: z.string().min(1, "Required"),
  yearsOfExperience:  z.coerce.number().min(0),
});

const profColor = (level: string) => {
  const l = level.toLowerCase();
  if (l.includes("expert") || l.includes("advanced")) return "success";
  if (l.includes("intermediate")) return "info";
  return "default";
};

function SkillTab({ id, emp, canWrite }: { id: string; emp: EmployeeDetail; canWrite: boolean }) {
  const [open, setOpen]       = useState(false);
  const [editing, setEditing] = useState<Skill | null>(null);
  const [search, setSearch]   = useState("");
  const keepOpenRef           = useRef(false);

  const addMut = useAddSkill(id);
  const updMut = useUpdateSkill(id);
  const delMut = useDeleteSkill(id);
  const { data: skills } = useSkills();
  const { data: profs }  = useProficiencyLevels();

  const addForm  = useForm<z.infer<typeof skillSchema>>({ resolver: zodResolver(skillSchema) });
  const editForm = useForm<z.infer<typeof skillEditSchema>>({ resolver: zodResolver(skillEditSchema) });

  const onAdd = (v: z.infer<typeof skillSchema>) => {
    addMut.mutate(v as Parameters<typeof addMut.mutate>[0], {
      onSuccess: () => {
        addForm.reset();
        if (!keepOpenRef.current) setOpen(false);
        keepOpenRef.current = false;
      },
    });
  };

  const onEdit = (v: z.infer<typeof skillEditSchema>) => {
    if (!editing) return;
    updMut.mutate({ id: editing.id, data: v }, { onSuccess: () => setEditing(null) });
  };

  useEffect(() => {
    if (editing) {
      editForm.reset({
        proficiencyLevelId: editing.proficiencyLevel.id,
        yearsOfExperience:  editing.yearsOfExperience,
      });
    }
  }, [editing, editForm]);

  const filtered = search
    ? emp.skills.filter((s) =>
        s.skill.name.toLowerCase().includes(search.toLowerCase()) ||
        s.skill.category.name.toLowerCase().includes(search.toLowerCase()))
    : emp.skills;

  return (
    <SubCard
      title="Skills" icon={<Star className="w-4 h-4" />}
      onAdd={canWrite ? () => setOpen(true) : undefined}
      search={search} onSearch={setSearch}
    >
      {filtered.length === 0 ? (
        <EmptyState title={search ? "No matches" : "No skills recorded"} description={search ? "Try a different search." : "Add the employee's technical and soft skills."} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-5">
          {filtered.map((s) => (
            <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-700/40 border border-gray-100 dark:border-slate-700">
              <div>
                <p className="font-medium text-sm text-sage-600 dark:text-white">{s.skill.name}</p>
                <p className="text-xs text-gray-400 dark:text-slate-500">{s.skill.category.name} · {s.yearsOfExperience} yr{s.yearsOfExperience !== 1 ? "s" : ""}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={profColor(s.proficiencyLevel.level)}>{s.proficiencyLevel.level}</Badge>
                {canWrite && (
                  <>
                    <Tooltip label="Edit skill" side="left">
                      <button onClick={() => setEditing(s)} className={iconBtn}>
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </Tooltip>
                    <Tooltip label="Remove skill" side="left">
                      <button onClick={() => delMut.mutate(s.id)} className={iconBtnDanger}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </Tooltip>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add modal */}
      <Modal open={open} onClose={() => { setOpen(false); addForm.reset(); }} title="Add Skill" size="sm">
        <form onSubmit={addForm.handleSubmit(onAdd)} className="flex flex-col gap-4">
          <FormField label="Skill" required error={addForm.formState.errors.skillId?.message}>
            <Select {...addForm.register("skillId")} options={[
              { value: "", label: "Select skill" },
              ...(skills?.map((s) => ({ value: s.id, label: `${s.name} (${s.category.name})` })) ?? []),
            ]} />
          </FormField>
          <FormField label="Proficiency" required error={addForm.formState.errors.proficiencyLevelId?.message}>
            <Select {...addForm.register("proficiencyLevelId")} options={[
              { value: "", label: "Select level" },
              ...(profs?.map((p) => ({ value: p.id, label: p.level })) ?? []),
            ]} />
          </FormField>
          <FormField label="Years of Experience" required error={addForm.formState.errors.yearsOfExperience?.message}>
            <Input {...addForm.register("yearsOfExperience")} type="number" min={0} step={0.5} placeholder="e.g. 2.5" />
          </FormField>
          <div className="flex justify-between pt-2">
            <Button variant="secondary" type="button" onClick={() => { keepOpenRef.current = true; addForm.handleSubmit(onAdd)(); }}>
              Save &amp; Add Another
            </Button>
            <div className="flex gap-3">
              <Button variant="secondary" type="button" onClick={() => { setOpen(false); addForm.reset(); }}>Cancel</Button>
              <Button type="submit" loading={addMut.isPending}>Add</Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Edit modal */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title={`Edit Skill — ${editing?.skill.name ?? ""}`} size="sm">
        <form onSubmit={editForm.handleSubmit(onEdit)} className="flex flex-col gap-4">
          <FormField label="Proficiency" required error={editForm.formState.errors.proficiencyLevelId?.message}>
            <Select {...editForm.register("proficiencyLevelId")} options={[
              { value: "", label: "Select level" },
              ...(profs?.map((p) => ({ value: p.id, label: p.level })) ?? []),
            ]} />
          </FormField>
          <FormField label="Years of Experience" required error={editForm.formState.errors.yearsOfExperience?.message}>
            <Input {...editForm.register("yearsOfExperience")} type="number" min={0} step={0.5} placeholder="e.g. 2.5" />
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setEditing(null)}>Cancel</Button>
            <Button type="submit" loading={updMut.isPending}>Save Changes</Button>
          </div>
        </form>
      </Modal>
    </SubCard>
  );
}

// ── Certifications ────────────────────────────────────────────────────────────

const certSchema = z.object({
  certificationId: z.string().min(1, "Required"),
  issueDate:       z.string().min(1, "Required"),
  expiryDate:      z.string().optional(),
});
const certEditSchema = z.object({
  issueDate:  z.string().min(1, "Required"),
  expiryDate: z.string().optional(),
});

function CertTab({ id, emp, canWrite }: { id: string; emp: EmployeeDetail; canWrite: boolean }) {
  const [open, setOpen]       = useState(false);
  const [editing, setEditing] = useState<Certification | null>(null);
  const [search, setSearch]   = useState("");
  const keepOpenRef           = useRef(false);

  const addMut = useAddCertification(id);
  const updMut = useUpdateCertification(id);
  const delMut = useDeleteCertification(id);
  const { data: certs } = useCertifications();

  const addForm  = useForm<z.infer<typeof certSchema>>({ resolver: zodResolver(certSchema) });
  const editForm = useForm<z.infer<typeof certEditSchema>>({ resolver: zodResolver(certEditSchema) });

  const onAdd = (v: z.infer<typeof certSchema>) => {
    const payload = { ...v, expiryDate: v.expiryDate || undefined };
    addMut.mutate(payload as Parameters<typeof addMut.mutate>[0], {
      onSuccess: () => {
        addForm.reset();
        if (!keepOpenRef.current) setOpen(false);
        keepOpenRef.current = false;
      },
    });
  };

  const onEdit = (v: z.infer<typeof certEditSchema>) => {
    if (!editing) return;
    updMut.mutate({ id: editing.id, data: { ...v, expiryDate: v.expiryDate || null } }, {
      onSuccess: () => setEditing(null),
    });
  };

  useEffect(() => {
    if (editing) {
      editForm.reset({
        issueDate:  toInputDate(editing.issueDate),
        expiryDate: toInputDate(editing.expiryDate),
      });
    }
  }, [editing, editForm]);

  const filtered = search
    ? emp.certifications.filter((c) =>
        c.certification.name.toLowerCase().includes(search.toLowerCase()) ||
        c.certification.issuingBody.toLowerCase().includes(search.toLowerCase()))
    : emp.certifications;

  return (
    <SubCard
      title="Certifications" icon={<Award className="w-4 h-4" />}
      onAdd={canWrite ? () => setOpen(true) : undefined}
      search={search} onSearch={setSearch}
    >
      {filtered.length === 0 ? (
        <EmptyState title={search ? "No matches" : "No certifications"} description={search ? "Try a different search." : "Add professional certifications held by this employee."} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-5">
          {filtered.map((c) => (
            <div key={c.id} className="p-4 rounded-lg bg-gray-50 dark:bg-slate-700/40 border border-gray-100 dark:border-slate-700">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-sage-600 dark:text-white truncate">{c.certification.name}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">{c.certification.issuingBody}</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                    Issued: {fmtDate(c.issueDate)}
                    {c.expiryDate && ` · Expires: ${fmtDate(c.expiryDate)}`}
                  </p>
                  <div className="mt-1.5">
                    {c.isExpired
                      ? <Badge variant="danger">Expired</Badge>
                      : <Badge variant="success">Valid</Badge>
                    }
                  </div>
                </div>
                {canWrite && (
                  <div className="flex items-center gap-1 shrink-0">
                    <Tooltip label="Edit certification" side="left">
                      <button onClick={() => setEditing(c)} className={iconBtn}>
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </Tooltip>
                    <Tooltip label="Remove certification" side="left">
                      <button onClick={() => delMut.mutate(c.id)} className={iconBtnDanger}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </Tooltip>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add modal */}
      <Modal open={open} onClose={() => { setOpen(false); addForm.reset(); }} title="Add Certification" size="sm">
        <form onSubmit={addForm.handleSubmit(onAdd)} className="flex flex-col gap-4">
          <FormField label="Certification" required error={addForm.formState.errors.certificationId?.message}>
            <Select {...addForm.register("certificationId")} options={[
              { value: "", label: "Select certification" },
              ...(certs?.map((c) => ({ value: c.id, label: `${c.name} — ${c.issuingBody}` })) ?? []),
            ]} />
          </FormField>
          <FormField label="Issue Date" required error={addForm.formState.errors.issueDate?.message}>
            <Input {...addForm.register("issueDate")} type="date" />
          </FormField>
          <FormField label="Expiry Date" error={addForm.formState.errors.expiryDate?.message} hint="Leave blank if no expiry">
            <Input {...addForm.register("expiryDate")} type="date" />
          </FormField>
          <div className="flex justify-between pt-2">
            <Button variant="secondary" type="button" onClick={() => { keepOpenRef.current = true; addForm.handleSubmit(onAdd)(); }}>
              Save &amp; Add Another
            </Button>
            <div className="flex gap-3">
              <Button variant="secondary" type="button" onClick={() => { setOpen(false); addForm.reset(); }}>Cancel</Button>
              <Button type="submit" loading={addMut.isPending}>Add</Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Edit modal */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title={`Edit — ${editing?.certification.name ?? ""}`} size="sm">
        <form onSubmit={editForm.handleSubmit(onEdit)} className="flex flex-col gap-4">
          <FormField label="Issue Date" required error={editForm.formState.errors.issueDate?.message}>
            <Input {...editForm.register("issueDate")} type="date" />
          </FormField>
          <FormField label="Expiry Date" error={editForm.formState.errors.expiryDate?.message} hint="Leave blank to clear expiry">
            <Input {...editForm.register("expiryDate")} type="date" />
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setEditing(null)}>Cancel</Button>
            <Button type="submit" loading={updMut.isPending}>Save Changes</Button>
          </div>
        </form>
      </Modal>
    </SubCard>
  );
}

// ── ExperienceForm — extracted to avoid remount issues ────────────────────────

function ExperienceForm({ form, isCurrent, onSubmit, isPending, onCancel, extraFooter, orgTypes, expTypes }: {
  form: ReturnType<typeof useForm<z.infer<typeof expSchema>>>;
  isCurrent: boolean;
  onSubmit: (v: z.infer<typeof expSchema>) => void;
  isPending: boolean;
  onCancel: () => void;
  extraFooter?: React.ReactNode;
  orgTypes?: { id: string; name: string }[];
  expTypes?: { id: string; name: string }[];
}) {
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <FormField label="Organization Name" required error={form.formState.errors.organizationName?.message}>
        <Input {...form.register("organizationName")} placeholder="Company / Institution name" />
      </FormField>
      <FormField label="Designation Held" required error={form.formState.errors.designationHeld?.message}>
        <Input {...form.register("designationHeld")} placeholder="Role / Title" />
      </FormField>
      <FormField label="Organization Type" required error={form.formState.errors.organizationTypeId?.message}>
        <Select {...form.register("organizationTypeId")} options={[
          { value: "", label: "Select type" },
          ...(orgTypes?.map((o) => ({ value: o.id, label: o.name })) ?? []),
        ]} />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Start Date" required error={form.formState.errors.startDate?.message}>
          <Input {...form.register("startDate")} type="date" />
        </FormField>
        {!isCurrent && (
          <FormField label="End Date" error={form.formState.errors.endDate?.message}>
            <Input {...form.register("endDate")} type="date" />
          </FormField>
        )}
      </div>
      <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-300 cursor-pointer">
        <input type="checkbox" {...form.register("isCurrent")} className="rounded" />
        Currently working here
      </label>
      <FormField label="Experience Types" required error={form.formState.errors.experienceTypes?.message as string}>
        <div className="flex flex-wrap gap-2">
          {expTypes?.map((t) => (
            <label key={t.id} className="flex items-center gap-1.5 text-sm cursor-pointer">
              <input type="checkbox" value={t.id} {...form.register("experienceTypes")} className="rounded" />
              {t.name}
            </label>
          ))}
        </div>
      </FormField>
      <div className="flex justify-between pt-2">
        {extraFooter ?? <span />}
        <div className="flex gap-3">
          <Button variant="secondary" type="button" onClick={onCancel}>Cancel</Button>
          <Button type="submit" loading={isPending}>Save</Button>
        </div>
      </div>
    </form>
  );
}

// ── BPV History ───────────────────────────────────────────────────────────────

function BpvTab({ id }: { id: string }) {
  const { data, isLoading } = useBpvHistory(id);
  if (isLoading) return <SkeletonCard />;
  return (
    <Card padding="none">
      <CardHeader className="p-5 pb-0"><CardTitle icon={<TrendingUp className="w-4 h-4" />}>BPV Score History</CardTitle></CardHeader>
      {!data?.length ? (
        <EmptyState title="No BPV history" description="BPV will be calculated when qualifications, experience, skills or certifications are added." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-slate-700 text-xs text-gray-500 dark:text-slate-400 uppercase">
                <Th>Date</Th><Th>Total</Th><Th>Edu</Th><Th>Exp</Th><Th>Org</Th><Th>Skills</Th><Th>Certs</Th><Th>Trigger</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
              {data.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                  <Td>{fmtDate(b.calculatedAt)}</Td>
                  <Td><span className="font-semibold">{b.score.toFixed(1)}</span></Td>
                  <Td>{b.educationScore.toFixed(1)}</Td>
                  <Td>{b.experienceScore.toFixed(1)}</Td>
                  <Td>{b.orgScore.toFixed(1)}</Td>
                  <Td>{b.skillScore.toFixed(1)}</Td>
                  <Td>{b.certScore.toFixed(1)}</Td>
                  <Td><Badge variant="default">{b.triggerReason}</Badge></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

// ── SubCard — shared wrapper with search + add ─────────────────────────────────

function SubCard({ title, icon, onAdd, search, onSearch, children }: {
  title: string; icon: React.ReactNode;
  onAdd?: () => void;
  search?: string; onSearch?: (v: string) => void;
  children: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchOpen = hovered || focused || !!(search);

  return (
    <Card padding="none">
      <CardHeader className="px-5 py-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <CardTitle icon={icon}>{title}</CardTitle>
            {onAdd && (
              <Tooltip label={`Add ${title.toLowerCase()}`}>
                <button
                  onClick={onAdd}
                  className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#27B1AE] hover:bg-[#1e9e9b] text-white transition-all duration-150 active:scale-95 shadow-sm shadow-[#27B1AE]/20"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </Tooltip>
            )}
          </div>
          {onSearch && (
            <div
              className="flex items-center gap-1.5"
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
            >
              {/* Animated search input */}
              <div className={cn(
                "flex items-center gap-1.5 rounded-lg border bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl backdrop-saturate-150 transition-all duration-200 overflow-hidden",
                searchOpen
                  ? "w-44 px-2.5 py-1.5 border-gray-200 dark:border-slate-600 shadow-sm"
                  : "w-0 border-transparent opacity-0 pointer-events-none"
              )}>
                <Search className="w-3 h-3 shrink-0 text-gray-400 dark:text-slate-500" />
                <input
                  ref={inputRef}
                  value={search}
                  onChange={(e) => onSearch(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  placeholder="Search…"
                  className="flex-1 text-xs bg-transparent outline-none text-gray-700 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 min-w-0"
                />
                {search && (
                  <button onClick={() => onSearch("")} className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              {/* Search icon button — always visible, glows when open */}
              <button
                onClick={() => inputRef.current?.focus()}
                className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150 active:scale-95",
                  searchOpen || search
                    ? "bg-[#e8f7f7] dark:bg-[#27B1AE]/20 text-[#27B1AE] dark:text-[#4fc4c1]"
                    : "text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700"
                )}
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </CardHeader>
      {children}
    </Card>
  );
}

// ── Tiny helpers ──────────────────────────────────────────────────────────────

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-5 py-2.5 text-left font-semibold tracking-wide">{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-5 py-3 text-gray-700 dark:text-slate-300">{children}</td>;
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-gray-400 dark:text-slate-500 mt-0.5 shrink-0">{icon}</span>
      <div>
        <p className="text-xs text-gray-400 dark:text-slate-500">{label}</p>
        <p className="text-sm font-medium text-sage-600 dark:text-white break-all">{value}</p>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400 dark:text-slate-500">{label}</p>
      <p className="text-sm font-medium text-sage-600 dark:text-white">{value}</p>
    </div>
  );
}

function BpvBar({ label, value, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min(100, value);
  const bg = {
    blue: "bg-blue-500", emerald: "bg-emerald-500",
    purple: "bg-purple-500", amber: "bg-amber-500", rose: "bg-rose-500",
  }[color] ?? "bg-blue-500";
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 dark:text-slate-400 mb-1">
        <span>{label}</span><span>{value.toFixed(1)}</span>
      </div>
      <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${bg}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-5 w-48 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
      <div className="bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl backdrop-saturate-150 rounded-xl border border-gray-200 dark:border-slate-700 p-6 space-y-4">
        <div className="flex gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-slate-700 animate-pulse" />
          <div className="space-y-2">
            <div className="h-5 w-40 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="h-4 w-56 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
          </div>
        </div>
      </div>
      <SkeletonCard />
    </div>
  );
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
