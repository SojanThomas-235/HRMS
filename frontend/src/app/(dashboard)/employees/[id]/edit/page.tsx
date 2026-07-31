"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { RoleGuard } from "@/components/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save } from "lucide-react";
import {
  Button, Input, Select, Breadcrumb, BackButton,
  Card, CardHeader, CardTitle, FormField, SkeletonCard,
} from "@/components/ui";
import { useEmployee, useUpdateEmployee } from "@/hooks/employee/useEmployee";
import { useDepartments, useDesignations, useManagersList } from "@/hooks/useMasters";

const schema = z.object({
  fullName:      z.string().min(2, "Full name is required"),
  email:         z.string().email("Valid email required"),
  phone:         z.string().optional(),
  dateOfBirth:   z.string().optional(),
  dateOfJoining: z.string().min(1, "Required"),
  departmentId:  z.string().min(1, "Required"),
  designationId: z.string().min(1, "Required"),
  managerId:     z.string().optional(),
  status:        z.enum(["ACTIVE", "ON_NOTICE", "EXITED"]),
});

type FormValues = z.infer<typeof schema>;

const STATUS_OPTIONS = [
  { value: "ACTIVE",    label: "Active" },
  { value: "ON_NOTICE", label: "On Notice" },
  { value: "EXITED",    label: "Exited" },
];

export default function EditEmployeePage() {
  const params  = useParams<{ id: string }>();
  const id      = params.id;
  const router  = useRouter();

  const { data: emp, isLoading }  = useEmployee(id);
  const { data: depts }           = useDepartments();
  const { data: desigs }          = useDesignations();
  const { data: managers }        = useManagersList();
  const updateMut                 = useUpdateEmployee(id);

  const {
    register, handleSubmit, reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!emp) return;
    reset({
      fullName:      emp.fullName,
      email:         emp.email,
      phone:         emp.phone ?? "",
      dateOfBirth:   emp.dateOfBirth ? emp.dateOfBirth.split("T")[0] : "",
      dateOfJoining: emp.dateOfJoining.split("T")[0],
      departmentId:  emp.department.id,
      designationId: emp.designation.id,
      managerId:     emp.manager?.id ?? "",
      status:        emp.status,
    });
  }, [emp, reset]);

  const onSubmit = (values: FormValues) => {
    updateMut.mutate(
      {
        ...values,
        managerId:   values.managerId  || undefined,
        dateOfBirth: values.dateOfBirth || undefined,
        phone:       values.phone       || undefined,
      } as Parameters<typeof updateMut.mutate>[0],
      { onSuccess: () => router.push(`/employees/${id}`) }
    );
  };

  if (isLoading) return <SkeletonCard />;
  if (!emp) return <p className="text-gray-500 dark:text-slate-400">Employee not found.</p>;

  return (
    <RoleGuard require="employee:edit" redirectTo={`/employees/${id}`}>
    <div className="flex flex-col gap-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <Breadcrumb items={[
          { label: "Employees", href: "/employees" },
          { label: emp.fullName, href: `/employees/${id}` },
          { label: "Edit" },
        ]} />
        <BackButton href={`/employees/${id}`} label="Back to Profile" />
      </div>

      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-sage-600 dark:text-white">Edit Employee</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{emp.employeeCode} · {emp.fullName}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {/* Personal */}
        <Card padding="none">
          <CardHeader className="p-5 pb-0"><CardTitle>Personal Information</CardTitle></CardHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5">
            <FormField label="Full Name" required error={errors.fullName?.message} className="sm:col-span-2 lg:col-span-4">
              <Input {...register("fullName")} error={!!errors.fullName} />
            </FormField>
            <FormField label="Email" required error={errors.email?.message} className="lg:col-span-2">
              <Input {...register("email")} type="email" error={!!errors.email} />
            </FormField>
            <FormField label="Phone" error={errors.phone?.message}>
              <Input {...register("phone")} />
            </FormField>
            <FormField label="Date of Birth" error={errors.dateOfBirth?.message}>
              <Input {...register("dateOfBirth")} type="date" />
            </FormField>
            <FormField label="Date of Joining" required error={errors.dateOfJoining?.message}>
              <Input {...register("dateOfJoining")} type="date" error={!!errors.dateOfJoining} />
            </FormField>
          </div>
        </Card>

        {/* Work */}
        <Card padding="none">
          <CardHeader className="p-5 pb-0"><CardTitle>Work Details</CardTitle></CardHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5">
            <FormField label="Department" required error={errors.departmentId?.message}>
              <Select {...register("departmentId")} error={!!errors.departmentId} options={[
                { value: "", label: "Select department" },
                ...(depts?.map((d) => ({ value: d.id, label: d.name })) ?? []),
              ]} />
            </FormField>
            <FormField label="Designation" required error={errors.designationId?.message}>
              <Select {...register("designationId")} error={!!errors.designationId} options={[
                { value: "", label: "Select designation" },
                ...(desigs?.map((d) => ({ value: d.id, label: d.title + (d.grade ? ` (${d.grade})` : "") })) ?? []),
              ]} />
            </FormField>
            <FormField label="Status" required error={errors.status?.message}>
              <Select {...register("status")} options={STATUS_OPTIONS} />
            </FormField>
            <FormField label="Reporting Manager" error={errors.managerId?.message} className="lg:col-span-4">
              <Select {...register("managerId")} options={[
                { value: "", label: "No manager (top-level)" },
                ...(managers
                  ?.filter((m) => m.id !== id)
                  .map((m) => ({ value: m.id, label: `${m.fullName} — ${m.designation.title} (${m.employeeCode})` })) ?? []),
              ]} />
            </FormField>
          </div>
        </Card>

        <div className="flex justify-end gap-3 pb-4">
          <Button variant="secondary" type="button" onClick={() => router.push(`/employees/${id}`)}>
            Cancel
          </Button>
          <Button
            type="submit"
            leftIcon={<Save className="w-4 h-4" />}
            loading={isSubmitting || updateMut.isPending}
            disabled={!isDirty}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
    </RoleGuard>
  );
}
