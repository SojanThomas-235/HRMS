"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/axios";
import type { CreateEmployeeInput, UpdateEmployeeInput, AddQualificationInput, AddExperienceInput, AddSkillInput, AddCertificationInput } from "@hrms/validators";

export function useEmployee(id: string) {
  return useQuery({
    queryKey: ["employee", id],
    queryFn: async () => {
      const res = await api.get<{ data: unknown }>(`/employees/${id}`);
      return res.data.data as EmployeeDetail;
    },
    enabled: !!id,
  });
}

export function useBpvHistory(id: string) {
  return useQuery({
    queryKey: ["employee", id, "bpv"],
    queryFn: async () => {
      const res = await api.get<{ data: BpvEntry[] }>(`/employees/${id}/bpv`);
      return res.data.data;
    },
    enabled: !!id,
  });
}

export function useCreateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEmployeeInput) =>
      api.post<{ data: EmployeeDetail }>("/employees", data).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee created successfully");
    },
    onError: (e: unknown) => {
      const msg = (e as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message ?? "Failed to create employee";
      toast.error(msg);
    },
  });
}

export function useUpdateEmployee(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateEmployeeInput) =>
      api.put<{ data: EmployeeDetail }>(`/employees/${id}`, data).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employee", id] });
      qc.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee updated successfully");
    },
    onError: () => toast.error("Failed to update employee"),
  });
}

// Sub-resource mutations — each one invalidates the employee detail
function makeSubMutation<T>(employeeId: string, path: string, qc: ReturnType<typeof useQueryClient>, successMsg: string) {
  return useMutation({
    mutationFn: (data: T) =>
      api.post(`/employees/${employeeId}/${path}`, data).then((r) => (r as { data: { data: unknown } }).data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employee", employeeId] });
      toast.success(successMsg);
    },
    onError: () => toast.error(`Failed to add ${path}`),
  });
}

export function useAddQualification(employeeId: string) {
  const qc = useQueryClient();
  return makeSubMutation<AddQualificationInput>(employeeId, "qualifications", qc, "Qualification added");
}
export function useAddExperience(employeeId: string) {
  const qc = useQueryClient();
  return makeSubMutation<AddExperienceInput>(employeeId, "experience", qc, "Experience added");
}
export function useAddSkill(employeeId: string) {
  const qc = useQueryClient();
  return makeSubMutation<AddSkillInput>(employeeId, "skills", qc, "Skill added");
}
export function useAddCertification(employeeId: string) {
  const qc = useQueryClient();
  return makeSubMutation<AddCertificationInput>(employeeId, "certifications", qc, "Certification added");
}

function makeDeleteMutation(employeeId: string, subPath: string, qc: ReturnType<typeof useQueryClient>) {
  return useMutation({
    mutationFn: (subId: string) => api.delete(`/employees/${employeeId}/${subPath}/${subId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employee", employeeId] });
      toast.success("Removed successfully");
    },
    onError: () => toast.error("Failed to remove"),
  });
}

export function useDeleteQualification(employeeId: string) { const qc = useQueryClient(); return makeDeleteMutation(employeeId, "qualifications", qc); }
export function useDeleteExperience(employeeId: string)    { const qc = useQueryClient(); return makeDeleteMutation(employeeId, "experience", qc); }
export function useDeleteSkill(employeeId: string)         { const qc = useQueryClient(); return makeDeleteMutation(employeeId, "skills", qc); }
export function useDeleteCertification(employeeId: string) { const qc = useQueryClient(); return makeDeleteMutation(employeeId, "certifications", qc); }

// ── Types ─────────────────────────────────────────────────────────────────────

export interface EmployeeDetail {
  id: string; employeeCode: string; fullName: string; email: string;
  phone?: string; dateOfBirth?: string; dateOfJoining: string;
  status: "ACTIVE" | "ON_NOTICE" | "EXITED";
  department:  { id: string; name: string };
  designation: { id: string; title: string; grade?: string };
  manager?:    { id: string; fullName: string; employeeCode: string } | null;
  qualifications: Qualification[];
  experiences:    Experience[];
  skills:         Skill[];
  certifications: Certification[];
  bpvScores:      BpvEntry[];
  createdAt: string; updatedAt: string;
}

export interface Qualification {
  id: string; institution: string; yearOfCompletion: number; grade?: string;
  verificationStatus: string;
  qualificationType: { id: string; name: string; scoreContribution: number };
}

export interface Experience {
  id: string; organizationName: string; designationHeld: string;
  startDate: string; endDate?: string; isCurrent: boolean; yearsCalculated: number;
  organizationType: { id: string; name: string };
  experienceTypes: { experienceType: { id: string; name: string } }[];
}

export interface Skill {
  id: string; yearsOfExperience: number;
  skill: { id: string; name: string; code: string; category: { name: string } };
  proficiencyLevel: { id: string; level: string; scoreMultiplier: number };
}

export interface Certification {
  id: string; issueDate: string; expiryDate?: string; isExpired: boolean;
  certification: { id: string; name: string; issuingBody: string; scoreContribution: number };
}

export interface BpvEntry {
  id: string; score: number; educationScore: number; experienceScore: number;
  orgScore: number; skillScore: number; certScore: number;
  triggerReason: string; calculatedAt: string;
}
