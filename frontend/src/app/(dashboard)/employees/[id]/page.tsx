"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Pencil, GraduationCap, Briefcase, Star, Award, TrendingUp,
  Plus, Trash2, Mail, Phone, CalendarDays, User,
} from "lucide-react";
import {
  Button, Badge, Breadcrumb, BackButton, Avatar, Tabs, Card, CardHeader, CardTitle,
  CardDivider, EmptyState, Modal, FormField, Input, Select, SkeletonCard, Tooltip,
} from "@/components/ui";

const iconBtnDanger = "p-2 rounded-xl text-gray-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-150 active:scale-95";
import {
  useEmployee, useBpvHistory,
  useAddQualification, useDeleteQualification,
  useAddExperience, useDeleteExperience,
  useAddSkill, useDeleteSkill,
  useAddCertification, useDeleteCertification,
  type EmployeeDetail,
} from "@/hooks/employee/useEmployee";
import {
  useQualTypes, useProficiencyLevels, useSkills,
  useCertifications, useExpTypes, useOrgTypes,
} from "@/hooks/useMasters";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { usePermissions } from "@/hooks/usePermissions";

const statusVariant = (s: string) =>
  s === "ACTIVE" ? "success" : s === "ON_NOTICE" ? "warning" : "danger";

export default function EmployeeDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();

  const { can, isSelf, role } = usePermissions();
  const { data: emp, isLoading } = useEmployee(id);
  const [activeTab, setActiveTab] = useState("overview");

  // EMPLOYEE accessing someone else's profile → redirect to own
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

  // Determine write permissions
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
      {/* Top bar: breadcrumb left, back button right */}
      <div className="flex items-center justify-between">
        <Breadcrumb items={[
          { label: "Employees", href: "/employees" },
          { label: emp.fullName },
        ]} />
        <BackButton href="/employees" label="Back to Employees" />
      </div>

      {/* Header card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <Avatar name={emp.fullName} size="lg" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{emp.fullName}</h1>
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
                className="p-2 rounded-xl text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all duration-150 active:scale-95"
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

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab content */}
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
                <span className="text-lg text-gray-900 dark:text-white">{emp.bpvScores[0].score.toFixed(1)}</span>
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

function QualTab({ id, emp, canWrite }: { id: string; emp: EmployeeDetail; canWrite: boolean }) {
  const [open, setOpen] = useState(false);
  const addMut  = useAddQualification(id);
  const delMut  = useDeleteQualification(id);
  const { data: types } = useQualTypes();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof qualSchema>>({
    resolver: zodResolver(qualSchema),
  });

  const onSubmit = (v: z.infer<typeof qualSchema>) => {
    addMut.mutate(v as Parameters<typeof addMut.mutate>[0], { onSuccess: () => { reset(); setOpen(false); } });
  };

  return (
    <SubCard
      title="Qualifications" icon={<GraduationCap className="w-4 h-4" />}
      onAdd={canWrite ? () => setOpen(true) : undefined}
    >
      {emp.qualifications.length === 0 ? (
        <EmptyState title="No qualifications" description="Add the employee's educational background." />
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-slate-700 text-xs text-gray-500 dark:text-slate-400 uppercase">
              <Th>Type</Th><Th>Institution</Th><Th>Year</Th><Th>Grade</Th><Th>Status</Th><Th />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
            {emp.qualifications.map((q) => (
              <tr key={q.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                <Td>{q.qualificationType.name}</Td>
                <Td>{q.institution}</Td>
                <Td>{q.yearOfCompletion}</Td>
                <Td>{q.grade ?? "—"}</Td>
                <Td>
                  <Badge variant={q.verificationStatus === "VERIFIED" ? "success" : "warning"}>
                    {q.verificationStatus}
                  </Badge>
                </Td>
                <Td>
                  {canWrite && (
                    <Tooltip label="Remove qualification" side="left">
                      <button onClick={() => delMut.mutate(q.id)} className={iconBtnDanger}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </Tooltip>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add Qualification" size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <FormField label="Qualification Type" required error={errors.qualificationTypeId?.message}>
            <Select {...register("qualificationTypeId")} options={[
              { value: "", label: "Select type" },
              ...(types?.map((t) => ({ value: t.id, label: t.name })) ?? []),
            ]} />
          </FormField>
          <FormField label="Institution" required error={errors.institution?.message}>
            <Input {...register("institution")} placeholder="University / College name" />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Year of Completion" required error={errors.yearOfCompletion?.message}>
              <Input {...register("yearOfCompletion")} type="number" placeholder="2020" />
            </FormField>
            <FormField label="Grade / CGPA" error={errors.grade?.message}>
              <Input {...register("grade")} placeholder="e.g. First Class / 8.5" />
            </FormField>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" loading={addMut.isPending}>Add</Button>
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
  const [open, setOpen] = useState(false);
  const addMut  = useAddExperience(id);
  const delMut  = useDeleteExperience(id);
  const { data: orgTypes } = useOrgTypes();
  const { data: expTypes } = useExpTypes();

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<z.infer<typeof expSchema>>({
    resolver: zodResolver(expSchema),
    defaultValues: { isCurrent: false, experienceTypes: [] },
  });
  const isCurrent = watch("isCurrent");

  const onSubmit = (v: z.infer<typeof expSchema>) => {
    addMut.mutate(v as Parameters<typeof addMut.mutate>[0], { onSuccess: () => { reset(); setOpen(false); } });
  };

  return (
    <SubCard title="Experience" icon={<Briefcase className="w-4 h-4" />} onAdd={canWrite ? () => setOpen(true) : undefined}>
      {emp.experiences.length === 0 ? (
        <EmptyState title="No experience records" description="Add previous employment details." />
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-slate-700">
          {emp.experiences.map((ex) => (
            <div key={ex.id} className="py-4 flex items-start justify-between gap-4 px-5">
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">{ex.organizationName}</p>
                <p className="text-sm text-gray-500 dark:text-slate-400">{ex.designationHeld} · {ex.organizationType.name}</p>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                  {fmtDate(ex.startDate)} → {ex.isCurrent ? "Present" : ex.endDate ? fmtDate(ex.endDate) : "—"}
                  {" "}· {ex.yearsCalculated.toFixed(1)} yrs
                </p>
                <div className="flex gap-1 mt-1 flex-wrap">
                  {ex.experienceTypes.map((t) => (
                    <Badge key={t.experienceType.id} variant="info">{t.experienceType.name}</Badge>
                  ))}
                </div>
              </div>
              {canWrite && (
                <Tooltip label="Remove experience" side="left">
                  <button onClick={() => delMut.mutate(ex.id)} className={`${iconBtnDanger} shrink-0`}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </Tooltip>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add Experience" size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <FormField label="Organization Name" required error={errors.organizationName?.message}>
            <Input {...register("organizationName")} placeholder="Company / Institution name" />
          </FormField>
          <FormField label="Designation Held" required error={errors.designationHeld?.message}>
            <Input {...register("designationHeld")} placeholder="Role / Title" />
          </FormField>
          <FormField label="Organization Type" required error={errors.organizationTypeId?.message}>
            <Select {...register("organizationTypeId")} options={[
              { value: "", label: "Select type" },
              ...(orgTypes?.map((o) => ({ value: o.id, label: o.name })) ?? []),
            ]} />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Start Date" required error={errors.startDate?.message}>
              <Input {...register("startDate")} type="date" />
            </FormField>
            {!isCurrent && (
              <FormField label="End Date" error={errors.endDate?.message}>
                <Input {...register("endDate")} type="date" />
              </FormField>
            )}
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-300 cursor-pointer">
            <input type="checkbox" {...register("isCurrent")} className="rounded" />
            Currently working here
          </label>
          <FormField label="Experience Types" required error={errors.experienceTypes?.message as string}>
            <div className="flex flex-wrap gap-2">
              {expTypes?.map((t) => (
                <label key={t.id} className="flex items-center gap-1.5 text-sm cursor-pointer">
                  <input type="checkbox" value={t.id} {...register("experienceTypes")} className="rounded" />
                  {t.name}
                </label>
              ))}
            </div>
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" loading={addMut.isPending}>Add</Button>
          </div>
        </form>
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

function SkillTab({ id, emp, canWrite }: { id: string; emp: EmployeeDetail; canWrite: boolean }) {
  const [open, setOpen] = useState(false);
  const addMut = useAddSkill(id);
  const delMut = useDeleteSkill(id);
  const { data: skills } = useSkills();
  const { data: profs }  = useProficiencyLevels();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof skillSchema>>({
    resolver: zodResolver(skillSchema),
  });

  const onSubmit = (v: z.infer<typeof skillSchema>) => {
    addMut.mutate(v as Parameters<typeof addMut.mutate>[0], { onSuccess: () => { reset(); setOpen(false); } });
  };

  const profColor = (level: string) => {
    const l = level.toLowerCase();
    if (l.includes("expert") || l.includes("advanced")) return "success";
    if (l.includes("intermediate")) return "info";
    return "default";
  };

  return (
    <SubCard title="Skills" icon={<Star className="w-4 h-4" />} onAdd={canWrite ? () => setOpen(true) : undefined}>
      {emp.skills.length === 0 ? (
        <EmptyState title="No skills recorded" description="Add the employee's technical and soft skills." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-5">
          {emp.skills.map((s) => (
            <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-700/40 border border-gray-100 dark:border-slate-700">
              <div>
                <p className="font-medium text-sm text-gray-900 dark:text-white">{s.skill.name}</p>
                <p className="text-xs text-gray-400 dark:text-slate-500">{s.skill.category.name} · {s.yearsOfExperience} yr{s.yearsOfExperience !== 1 ? "s" : ""}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={profColor(s.proficiencyLevel.level)}>{s.proficiencyLevel.level}</Badge>
                {canWrite && (
                  <Tooltip label="Remove skill" side="left">
                    <button onClick={() => delMut.mutate(s.id)} className={iconBtnDanger}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </Tooltip>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add Skill" size="sm">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <FormField label="Skill" required error={errors.skillId?.message}>
            <Select {...register("skillId")} options={[
              { value: "", label: "Select skill" },
              ...(skills?.map((s) => ({ value: s.id, label: `${s.name} (${s.category.name})` })) ?? []),
            ]} />
          </FormField>
          <FormField label="Proficiency" required error={errors.proficiencyLevelId?.message}>
            <Select {...register("proficiencyLevelId")} options={[
              { value: "", label: "Select level" },
              ...(profs?.map((p) => ({ value: p.id, label: p.level })) ?? []),
            ]} />
          </FormField>
          <FormField label="Years of Experience" required error={errors.yearsOfExperience?.message}>
            <Input {...register("yearsOfExperience")} type="number" min={0} step={0.5} placeholder="e.g. 2.5" />
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" loading={addMut.isPending}>Add</Button>
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

function CertTab({ id, emp, canWrite }: { id: string; emp: EmployeeDetail; canWrite: boolean }) {
  const [open, setOpen] = useState(false);
  const addMut = useAddCertification(id);
  const delMut = useDeleteCertification(id);
  const { data: certs } = useCertifications();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof certSchema>>({
    resolver: zodResolver(certSchema),
  });

  const onSubmit = (v: z.infer<typeof certSchema>) => {
    addMut.mutate(v as Parameters<typeof addMut.mutate>[0], { onSuccess: () => { reset(); setOpen(false); } });
  };

  return (
    <SubCard title="Certifications" icon={<Award className="w-4 h-4" />} onAdd={canWrite ? () => setOpen(true) : undefined}>
      {emp.certifications.length === 0 ? (
        <EmptyState title="No certifications" description="Add professional certifications held by this employee." />
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-slate-700">
          {emp.certifications.map((c) => (
            <div key={c.id} className="py-4 px-5 flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{c.certification.name}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">{c.certification.issuingBody}</p>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                  Issued: {fmtDate(c.issueDate)}
                  {c.expiryDate && ` · Expires: ${fmtDate(c.expiryDate)}`}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {c.isExpired
                  ? <Badge variant="danger">Expired</Badge>
                  : <Badge variant="success">Valid</Badge>
                }
                {canWrite && (
                  <Tooltip label="Remove certification" side="left">
                    <button onClick={() => delMut.mutate(c.id)} className={iconBtnDanger}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </Tooltip>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add Certification" size="sm">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <FormField label="Certification" required error={errors.certificationId?.message}>
            <Select {...register("certificationId")} options={[
              { value: "", label: "Select certification" },
              ...(certs?.map((c) => ({ value: c.id, label: `${c.name} — ${c.issuingBody}` })) ?? []),
            ]} />
          </FormField>
          <FormField label="Issue Date" required error={errors.issueDate?.message}>
            <Input {...register("issueDate")} type="date" />
          </FormField>
          <FormField label="Expiry Date" error={errors.expiryDate?.message} hint="Leave blank if no expiry">
            <Input {...register("expiryDate")} type="date" />
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" loading={addMut.isPending}>Add</Button>
          </div>
        </form>
      </Modal>
    </SubCard>
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

// ── Shared helpers ────────────────────────────────────────────────────────────

function SubCard({ title, icon, onAdd, children }: {
  title: string; icon: React.ReactNode;
  onAdd?: () => void; children: React.ReactNode;
}) {
  return (
    <Card padding="none">
      <CardHeader className="p-5 pb-0">
        <div className="flex items-center justify-between">
          <CardTitle icon={icon}>{title}</CardTitle>
          {onAdd && (
            <Tooltip label={`Add ${title.toLowerCase()}`}>
              <button
                onClick={onAdd}
                className="p-2 rounded-xl text-gray-400 dark:text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-150 active:scale-95"
              >
                <Plus className="w-4 h-4" />
              </button>
            </Tooltip>
          )}
        </div>
      </CardHeader>
      {children}
    </Card>
  );
}

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
        <p className="text-sm font-medium text-gray-900 dark:text-white break-all">{value}</p>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400 dark:text-slate-500">{label}</p>
      <p className="text-sm font-medium text-gray-900 dark:text-white">{value}</p>
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
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 space-y-4">
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
