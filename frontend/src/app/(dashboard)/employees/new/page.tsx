"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserPlus, User, Briefcase, Lock, Plus, Building2, Medal } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Button, Input, Select, Breadcrumb, BackButton, FormField, Modal, Tooltip,
} from "@/components/ui";
import { useCreateEmployee } from "@/hooks/employee/useEmployee";
import { useDepartments, useDesignations, useManagersList } from "@/hooks/useMasters";
import { useCreateDept, useCreateDesig } from "@/hooks/useConfig";
import { RoleGuard } from "@/components/auth";
import { cn } from "@/lib/utils";

// ── Schemas ───────────────────────────────────────────────────────────────────

const schema = z.object({
  fullName:      z.string().min(2, "Full name is required"),
  email:         z.string().email("Valid email required"),
  phone:         z.string().optional(),
  dateOfBirth:   z.string().optional(),
  dateOfJoining: z.string().min(1, "Date of joining is required"),
  departmentId:  z.string().min(1, "Department is required"),
  designationId: z.string().min(1, "Designation is required"),
  managerId:     z.string().optional(),
  password:      z.string().min(8, "Password must be at least 8 characters"),
});

const deptSchema = z.object({
  name: z.string().min(2, "Name required"),
  code: z.string().min(1, "Code required").max(10, "Max 10 chars"),
  description: z.string().optional(),
});

const desigSchema = z.object({
  title: z.string().min(2, "Title required"),
  code:  z.string().min(1, "Code required").max(10, "Max 10 chars"),
  grade: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

// ── Helper to auto-generate a code from a name ────────────────────────────────
function toCode(name: string) {
  return name.replace(/[^a-zA-Z0-9 ]/g, "").split(/\s+/).map((w) => w[0]).join("").toUpperCase().slice(0, 8);
}

// ── Section header component ──────────────────────────────────────────────────
function Section({ step, icon: Icon, title, subtitle, children }: {
  step: number; icon: React.ElementType; title: string; subtitle: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl backdrop-saturate-150 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
      <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-100 dark:border-slate-700/70">
        <div className="relative shrink-0">
          <div className="w-10 h-10 rounded-xl bg-[#e8f7f7] dark:bg-[#27B1AE]/30 flex items-center justify-center">
            <Icon className="w-5 h-5 text-[#27B1AE] dark:text-[#4fc4c1]" />
          </div>
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#27B1AE] text-white text-[9px] font-bold flex items-center justify-center leading-none">
            {step}
          </span>
        </div>
        <div>
          <p className="font-semibold text-sm text-sage-600 dark:text-white">{title}</p>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{subtitle}</p>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ── Quick-add Dept Modal ──────────────────────────────────────────────────────
function AddDeptModal({ open, onClose, onCreated }: {
  open: boolean; onClose: () => void; onCreated: (id: string) => void;
}) {
  const createDept = useCreateDept();
  const qc = useQueryClient();
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<z.infer<typeof deptSchema>>({ resolver: zodResolver(deptSchema) });
  const name = watch("name") ?? "";

  const onSubmit = (v: z.infer<typeof deptSchema>) => {
    createDept.mutate(v, {
      onSuccess: (d) => {
        qc.invalidateQueries({ queryKey: ["masters", "departments"] });
        onCreated((d as { id: string }).id);
        reset();
        onClose();
      },
    });
  };

  return (
    <Modal open={open} onClose={() => { reset(); onClose(); }} title="Quick Add Department" size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField label="Department Name" required error={errors.name?.message}>
          <Input
            {...register("name")}
            placeholder="e.g. Engineering"
            onChange={(e) => {
              register("name").onChange(e);
              setValue("code", toCode(e.target.value), { shouldValidate: false });
            }}
          />
        </FormField>
        <FormField label="Code" required error={errors.code?.message} hint="Short identifier, max 10 chars">
          <Input {...register("code")} placeholder="e.g. ENG" className="uppercase" />
        </FormField>
        <FormField label="Description" error={errors.description?.message}>
          <Input {...register("description")} placeholder="Optional description" />
        </FormField>
        <div className="flex justify-end gap-3 pt-1">
          <Button variant="secondary" type="button" onClick={() => { reset(); onClose(); }}>Cancel</Button>
          <Button type="submit" loading={createDept.isPending} leftIcon={<Building2 className="w-3.5 h-3.5" />}>
            Create Department
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ── Quick-add Designation Modal ───────────────────────────────────────────────
function AddDesigModal({ open, onClose, onCreated }: {
  open: boolean; onClose: () => void; onCreated: (id: string) => void;
}) {
  const createDesig = useCreateDesig();
  const qc = useQueryClient();
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<z.infer<typeof desigSchema>>({ resolver: zodResolver(desigSchema) });
  const title = watch("title") ?? "";

  const onSubmit = (v: z.infer<typeof desigSchema>) => {
    createDesig.mutate({ ...v, grade: v.grade || undefined } as Parameters<typeof createDesig.mutate>[0], {
      onSuccess: (d) => {
        qc.invalidateQueries({ queryKey: ["masters", "designations"] });
        onCreated((d as { id: string }).id);
        reset();
        onClose();
      },
    });
  };

  return (
    <Modal open={open} onClose={() => { reset(); onClose(); }} title="Quick Add Designation" size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField label="Designation Title" required error={errors.title?.message}>
          <Input
            {...register("title")}
            placeholder="e.g. Software Engineer"
            onChange={(e) => {
              register("title").onChange(e);
              setValue("code", toCode(e.target.value), { shouldValidate: false });
            }}
          />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Code" required error={errors.code?.message}>
            <Input {...register("code")} placeholder="e.g. SE" className="uppercase" />
          </FormField>
          <FormField label="Grade" error={errors.grade?.message} hint="Optional">
            <Input {...register("grade")} placeholder="e.g. L3" />
          </FormField>
        </div>
        <div className="flex justify-end gap-3 pt-1">
          <Button variant="secondary" type="button" onClick={() => { reset(); onClose(); }}>Cancel</Button>
          <Button type="submit" loading={createDesig.isPending} leftIcon={<Medal className="w-3.5 h-3.5" />}>
            Create Designation
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ══════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════

export default function NewEmployeePage() {
  const router = useRouter();
  const createMut = useCreateEmployee();

  const { data: depts }    = useDepartments();
  const { data: desigs }   = useDesignations();
  const { data: managers } = useManagersList();

  const {
    register, handleSubmit, setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const [submitError,  setSubmitError]  = useState("");
  const [deptModal,    setDeptModal]    = useState(false);
  const [desigModal,   setDesigModal]   = useState(false);

  const onSubmit = async (values: FormValues) => {
    setSubmitError("");
    createMut.mutate(
      {
        ...values,
        managerId:   values.managerId   || undefined,
        dateOfBirth: values.dateOfBirth || undefined,
        phone:       values.phone       || undefined,
      } as Parameters<typeof createMut.mutate>[0],
      {
        onSuccess: (emp) => router.push(`/employees/${(emp as { id: string }).id}`),
        onError: (e: unknown) => {
          const msg = (e as { response?: { data?: { error?: { message?: string } } } })
            ?.response?.data?.error?.message ?? "Failed to create employee";
          setSubmitError(msg);
        },
      }
    );
  };

  const addBtn = cn(
    "w-9 h-9 shrink-0 rounded-lg flex items-center justify-center",
    "bg-[#27B1AE] hover:bg-[#1e9e9b] text-white",
    "transition-all duration-150 active:scale-95 shadow-sm shadow-[#27B1AE]/20"
  );

  return (
    <RoleGuard require="employee:create" redirectTo="/employees">
      <div className="flex flex-col gap-5">
        {/* Breadcrumb row */}
        <div className="flex items-center justify-between">
          <Breadcrumb items={[{ label: "Employees", href: "/employees" }, { label: "New Employee" }]} />
          <BackButton href="/employees" label="Back to Employees" />
        </div>

        {/* Hero banner */}
        <div className="relative overflow-hidden bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl backdrop-saturate-150 rounded-xl border border-gray-200 dark:border-slate-700 px-6 py-5">
          {/* Decorative gradient orb */}
          <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-[#27B1AE]/5 dark:bg-[#4fc4c1]/5" />
          <div className="absolute -right-4 -bottom-8 w-32 h-32 rounded-full bg-[#27B1AE]/5 dark:bg-[#4fc4c1]/5" />

          <div className="relative flex items-center gap-5">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#27B1AE] to-[#27B1AE] flex items-center justify-center shadow-lg shadow-[#27B1AE]/25 shrink-0">
              <UserPlus className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-sage-600 dark:text-white">Add New Employee</h1>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                Fill in the details below to onboard a new team member. Fields marked <span className="text-red-500">*</span> are required.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          {/* ── Section 1: Personal Information ── */}
          <Section step={1} icon={User} title="Personal Information" subtitle="Basic identity and contact details">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormField label="Full Name" required error={errors.fullName?.message} className="lg:col-span-3">
                <Input {...register("fullName")} placeholder="e.g. Arun Kumar" error={!!errors.fullName} />
              </FormField>
              <FormField label="Email Address" required error={errors.email?.message} className="lg:col-span-2">
                <Input {...register("email")} type="email" placeholder="arun@company.com" error={!!errors.email} />
              </FormField>
              <FormField label="Phone" error={errors.phone?.message}>
                <Input {...register("phone")} placeholder="+91 98765 43210" />
              </FormField>
              <FormField label="Date of Birth" error={errors.dateOfBirth?.message}>
                <Input {...register("dateOfBirth")} type="date" />
              </FormField>
              <FormField label="Date of Joining" required error={errors.dateOfJoining?.message}>
                <Input {...register("dateOfJoining")} type="date" error={!!errors.dateOfJoining} />
              </FormField>
            </div>
          </Section>

          {/* ── Section 2: Work Details ── */}
          <Section step={2} icon={Briefcase} title="Work Details" subtitle="Role, department, and reporting structure">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Department + quick-add */}
              <FormField label="Department" required error={errors.departmentId?.message}>
                <div className="flex gap-2 items-start">
                  <div className="flex-1">
                    <Select
                      {...register("departmentId")}
                      error={!!errors.departmentId}
                      options={[
                        { value: "", label: "Select department" },
                        ...(depts?.map((d) => ({ value: d.id, label: d.name })) ?? []),
                      ]}
                    />
                  </div>
                  <Tooltip label="Add new department" side="top">
                    <button type="button" onClick={() => setDeptModal(true)} className={addBtn}>
                      <Plus className="w-4 h-4" />
                    </button>
                  </Tooltip>
                </div>
              </FormField>

              {/* Designation + quick-add */}
              <FormField label="Designation" required error={errors.designationId?.message}>
                <div className="flex gap-2 items-start">
                  <div className="flex-1">
                    <Select
                      {...register("designationId")}
                      error={!!errors.designationId}
                      options={[
                        { value: "", label: "Select designation" },
                        ...(desigs?.map((d) => ({ value: d.id, label: d.title + (d.grade ? ` (${d.grade})` : "") })) ?? []),
                      ]}
                    />
                  </div>
                  <Tooltip label="Add new designation" side="top">
                    <button type="button" onClick={() => setDesigModal(true)} className={addBtn}>
                      <Plus className="w-4 h-4" />
                    </button>
                  </Tooltip>
                </div>
              </FormField>

              <FormField label="Reporting Manager" error={errors.managerId?.message} className="sm:col-span-2">
                <Select
                  {...register("managerId")}
                  options={[
                    { value: "", label: "No manager (top-level)" },
                    ...(managers?.map((m) => ({
                      value: m.id,
                      label: `${m.fullName} — ${m.designation.title} (${m.employeeCode})`,
                    })) ?? []),
                  ]}
                />
              </FormField>
            </div>
          </Section>

          {/* ── Section 3: Account Credentials ── */}
          <Section step={3} icon={Lock} title="Account Credentials" subtitle="Initial login password for the employee">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="Initial Password"
                required
                error={errors.password?.message}
                hint="Employee can change this after first login"
              >
                <Input {...register("password")} type="password" placeholder="Min. 8 characters" error={!!errors.password} />
              </FormField>

              {/* Password strength hint panel */}
              <div className="hidden sm:flex items-center">
                <div className="w-full p-3 rounded-lg bg-amber-50 dark:bg-amber-900/15 border border-amber-100 dark:border-amber-800/40">
                  <p className="text-xs font-semibold text-amber-800 dark:text-amber-400 mb-1.5">Password tips</p>
                  <ul className="space-y-1">
                    {["At least 8 characters", "Mix of upper & lowercase", "Include numbers or symbols"].map((t) => (
                      <li key={t} className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-500">
                        <span className="w-1 h-1 rounded-full bg-amber-400 shrink-0" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </Section>

          {/* Error message */}
          {submitError && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/40">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              <p className="text-sm text-red-600 dark:text-red-400">{submitError}</p>
            </div>
          )}

          {/* Footer actions */}
          <div className="flex items-center justify-between pb-4">
            <p className="text-xs text-gray-400 dark:text-slate-500">
              Employee will receive login instructions at their email address.
            </p>
            <div className="flex items-center gap-3">
              <Button variant="secondary" type="button" onClick={() => router.push("/employees")}>
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting || createMut.isPending} leftIcon={<UserPlus className="w-4 h-4" />}>
                Create Employee
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Quick-add modals */}
      <AddDeptModal
        open={deptModal}
        onClose={() => setDeptModal(false)}
        onCreated={(id) => setValue("departmentId", id)}
      />
      <AddDesigModal
        open={desigModal}
        onClose={() => setDesigModal(false)}
        onCreated={(id) => setValue("designationId", id)}
      />
    </RoleGuard>
  );
}
