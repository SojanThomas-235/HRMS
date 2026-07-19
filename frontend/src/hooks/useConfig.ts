"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

// ── Generic helpers ────────────────────────────────────────────────────────────

const get  = <T>(path: string) =>
  api.get<{ data: T }>(`/masters/${path}`).then((r) => r.data.data);

const post = <T>(path: string, body: unknown) =>
  api.post<{ data: T }>(`/masters/${path}`, body).then((r) => r.data.data);

const put  = <T>(path: string, id: string, body: unknown) =>
  api.put<{ data: T }>(`/masters/${path}/${id}`, body).then((r) => r.data.data);

// ── Query keys ─────────────────────────────────────────────────────────────────

const QK = {
  departments:     ["config", "departments"],
  designations:    ["config", "designations"],
  qualifications:  ["config", "qualifications"],
  skillCategories: ["config", "skill-categories"],
  skills:          ["config", "skills"],
  proficiency:     ["config", "proficiency-levels"],
  certifications:  ["config", "certifications"],
  expTypes:        ["config", "experience-types"],
  orgTypes:        ["config", "organization-types"],
  bpvConfig:       ["config", "bpv-config"],
  expBands:        ["config", "experience-bands"],
};

// ── Types ──────────────────────────────────────────────────────────────────────

export interface Department  { id: string; name: string; code: string; description?: string; isActive: boolean }
export interface Designation { id: string; title: string; code: string; grade?: string; isActive: boolean }
export interface QualType    { id: string; name: string; code: string; scoreContribution: number; sortOrder: number; isActive: boolean }
export interface SkillCategory { id: string; name: string; code: string; isActive: boolean; skills: SkillItem[] }
export interface SkillItem   { id: string; name: string; code: string; categoryId: string; isActive: boolean; category?: { name: string } }
export interface Proficiency { id: string; level: string; code: string; sortOrder: number; scoreMultiplier: number; isActive: boolean }
export interface Certification { id: string; name: string; code: string; issuingBody: string; scoreContribution: number; hasExpiry: boolean; expiryAlertDays: number; isActive: boolean }
export interface ExpType     { id: string; name: string; code: string; isActive: boolean }
export interface OrgType     { id: string; name: string; code: string; scoreContribution: number; isActive: boolean }
export interface BpvConfig   { id: string; educationPct: number; experiencePct: number; orgProfilePct: number; skillsPct: number; certsPct: number; effectiveFrom: string; isActive: boolean; changeReason: string; createdBy: string }
export interface ExpBand     { id: string; yearsFrom: number; yearsTo: number; scorePoints: number; isActive: boolean }

// ── Queries ────────────────────────────────────────────────────────────────────

export const useDepartmentsConfig    = () => useQuery({ queryKey: QK.departments,     queryFn: () => get<Department[]>("departments"),       staleTime: 60_000 });
export const useDesignationsConfig   = () => useQuery({ queryKey: QK.designations,    queryFn: () => get<Designation[]>("designations"),     staleTime: 60_000 });
export const useQualificationsConfig = () => useQuery({ queryKey: QK.qualifications,  queryFn: () => get<QualType[]>("qualifications"),      staleTime: 60_000 });
export const useSkillCategoriesConfig= () => useQuery({ queryKey: QK.skillCategories, queryFn: () => get<SkillCategory[]>("skill-categories"), staleTime: 60_000 });
export const useSkillsConfig         = () => useQuery({ queryKey: QK.skills,          queryFn: () => get<SkillItem[]>("skills"),             staleTime: 60_000 });
export const useProficiencyConfig    = () => useQuery({ queryKey: QK.proficiency,     queryFn: () => get<Proficiency[]>("proficiency-levels"), staleTime: 60_000 });
export const useCertificationsConfig = () => useQuery({ queryKey: QK.certifications,  queryFn: () => get<Certification[]>("certifications"), staleTime: 60_000 });
export const useExpTypesConfig       = () => useQuery({ queryKey: QK.expTypes,        queryFn: () => get<ExpType[]>("experience-types"),     staleTime: 60_000 });
export const useOrgTypesConfig       = () => useQuery({ queryKey: QK.orgTypes,        queryFn: () => get<OrgType[]>("organization-types"),   staleTime: 60_000 });
export const useBpvConfig            = () => useQuery({ queryKey: QK.bpvConfig,       queryFn: () => get<BpvConfig[]>("bpv-config"),         staleTime: 60_000 });
export const useExpBandsConfig       = () => useQuery({ queryKey: QK.expBands,        queryFn: () => get<ExpBand[]>("experience-bands"),     staleTime: 60_000 });

// ── Mutation factory ───────────────────────────────────────────────────────────

function useCreate<T>(path: string, queryKey: string[]) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => post<T>(path, body),
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });
}

function useUpdate<T>(path: string, queryKey: string[]) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string } & Record<string, unknown>) => put<T>(path, id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });
}

// ── Exports ────────────────────────────────────────────────────────────────────

export const useCreateDept    = () => useCreate<Department>("departments",       QK.departments);
export const useUpdateDept    = () => useUpdate<Department>("departments",       QK.departments);

export const useCreateDesig   = () => useCreate<Designation>("designations",    QK.designations);
export const useUpdateDesig   = () => useUpdate<Designation>("designations",    QK.designations);

export const useCreateQual    = () => useCreate<QualType>("qualifications",     QK.qualifications);
export const useUpdateQual    = () => useUpdate<QualType>("qualifications",     QK.qualifications);

export const useCreateSkillCat= () => useCreate<SkillCategory>("skill-categories", QK.skillCategories);
export const useUpdateSkillCat= () => useUpdate<SkillCategory>("skill-categories", QK.skillCategories);

export const useCreateSkill   = () => useCreate<SkillItem>("skills",            QK.skills);
export const useUpdateSkill   = () => useUpdate<SkillItem>("skills",            QK.skills);

export const useCreateProf    = () => useCreate<Proficiency>("proficiency-levels", QK.proficiency);
export const useUpdateProf    = () => useUpdate<Proficiency>("proficiency-levels", QK.proficiency);

export const useCreateCert    = () => useCreate<Certification>("certifications",QK.certifications);
export const useUpdateCert    = () => useUpdate<Certification>("certifications",QK.certifications);

export const useCreateExpType = () => useCreate<ExpType>("experience-types",    QK.expTypes);
export const useUpdateExpType = () => useUpdate<ExpType>("experience-types",    QK.expTypes);

export const useCreateOrgType = () => useCreate<OrgType>("organization-types",  QK.orgTypes);
export const useUpdateOrgType = () => useUpdate<OrgType>("organization-types",  QK.orgTypes);

export const useCreateBpvConfig = () => useCreate<BpvConfig>("bpv-config",     QK.bpvConfig);

export const useCreateExpBand = () => useCreate<ExpBand>("experience-bands",   QK.expBands);
export const useUpdateExpBand = () => useUpdate<ExpBand>("experience-bands",   QK.expBands);
