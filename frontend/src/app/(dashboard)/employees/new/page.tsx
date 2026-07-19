"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Briefcase, Lock } from "lucide-react";
import {
  Button, Input, Select, Breadcrumb, BackButton, Card, CardHeader, CardTitle, FormField,
} from "@/components/ui";
import { useCreateEmployee } from "@/hooks/employee/useEmployee";
import { useDepartments, useDesignations, useManagersList } from "@/hooks/useMasters";
import { RoleGuard } from "@/components/auth";

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

type FormValues = z.infer<typeof schema>;

export default function NewEmployeePage() {
  const router = useRouter();
  const createMut = useCreateEmployee();

  const { data: depts }    = useDepartments();
  const { data: desigs }   = useDesignations();
  const { data: managers } = useManagersList();

  const {
    register, handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const [submitError, setSubmitError] = useState("");

  const onSubmit = async (values: FormValues) => {
    setSubmitError("");
    createMut.mutate(
      {
        ...values,
        managerId: values.managerId || undefined,
        dateOfBirth: values.dateOfBirth || undefined,
        phone: values.phone || undefined,
      } as Parameters<typeof createMut.mutate>[0],
      {
        onSuccess: (emp) => router.push(`/employees/${(emp as {id:string}).id}`),
        onError: (e: unknown) => {
          const msg = (e as { response?: { data?: { error?: { message?: string } } } })
            ?.response?.data?.error?.message ?? "Failed to create employee";
          setSubmitError(msg);
        },
      }
    );
  };

  return (
    <RoleGuard require="employee:create" redirectTo="/employees">
    <div className="flex flex-col gap-6">
      {/* Top bar: breadcrumb left, back button right */}
      <div className="flex items-center justify-between">
        <Breadcrumb items={[{ label: "Employees", href: "/employees" }, { label: "New Employee" }]} />
        <BackButton href="/employees" label="Back to Employees" />
      </div>

      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add Employee</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Fill in the details to onboard a new employee</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {/* Personal Info */}
        <Card padding="none">
          <CardHeader className="p-5 pb-0">
            <CardTitle icon={<User className="w-4 h-4" />}>Personal Information</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5">
            <FormField label="Full Name" required error={errors.fullName?.message} className="sm:col-span-2 lg:col-span-4">
              <Input {...register("fullName")} placeholder="e.g. Arun Kumar" error={!!errors.fullName} />
            </FormField>
            <FormField label="Email" required error={errors.email?.message} className="lg:col-span-2">
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
        </Card>

        {/* Work Info */}
        <Card padding="none">
          <CardHeader className="p-5 pb-0">
            <CardTitle icon={<Briefcase className="w-4 h-4" />}>Work Details</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5">
            <FormField label="Department" required error={errors.departmentId?.message}>
              <Select
                {...register("departmentId")}
                error={!!errors.departmentId}
                options={[
                  { value: "", label: "Select department" },
                  ...(depts?.map((d) => ({ value: d.id, label: d.name })) ?? []),
                ]}
              />
            </FormField>
            <FormField label="Designation" required error={errors.designationId?.message}>
              <Select
                {...register("designationId")}
                error={!!errors.designationId}
                options={[
                  { value: "", label: "Select designation" },
                  ...(desigs?.map((d) => ({ value: d.id, label: d.title + (d.grade ? ` (${d.grade})` : "") })) ?? []),
                ]}
              />
            </FormField>
            <FormField label="Reporting Manager" error={errors.managerId?.message} className="lg:col-span-2">
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
        </Card>

        {/* Account */}
        <Card padding="none">
          <CardHeader className="p-5 pb-0">
            <CardTitle icon={<Lock className="w-4 h-4" />}>Account Credentials</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-5">
            <FormField
              label="Initial Password"
              required
              error={errors.password?.message}
              hint="Employee can change this after first login"
              className="lg:col-span-2"
            >
              <Input {...register("password")} type="password" placeholder="Min. 8 characters" error={!!errors.password} />
            </FormField>
          </div>
        </Card>

        {submitError && (
          <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-lg">
            {submitError}
          </p>
        )}

        <div className="flex justify-end gap-3 pb-4">
          <Button variant="secondary" type="button" onClick={() => router.push("/employees")}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting || createMut.isPending}>
            Create Employee
          </Button>
        </div>
      </form>
    </div>
    </RoleGuard>
  );
}
