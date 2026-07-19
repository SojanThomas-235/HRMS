"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

const fetch = <T>(path: string) =>
  api.get<{ data: T }>(`/masters/${path}`).then((r) => r.data.data);

export const useDepartments   = () => useQuery({ queryKey: ["masters", "departments"],   queryFn: () => fetch<{id:string;name:string;code:string}[]>("departments"),   staleTime: Infinity });
export const useDesignations  = () => useQuery({ queryKey: ["masters", "designations"],  queryFn: () => fetch<{id:string;title:string;grade?:string}[]>("designations"),  staleTime: Infinity });
export const useQualTypes     = () => useQuery({ queryKey: ["masters", "qualifications"],queryFn: () => fetch<{id:string;name:string;scoreContribution:number}[]>("qualifications"), staleTime: Infinity });
export const useSkillCategories = () => useQuery({ queryKey: ["masters", "skill-categories"], queryFn: () => fetch<{id:string;name:string;skills:{id:string;name:string}[]}[]>("skill-categories"), staleTime: Infinity });
export const useSkills        = () => useQuery({ queryKey: ["masters", "skills"],        queryFn: () => fetch<{id:string;name:string;code:string;category:{name:string}}[]>("skills"), staleTime: Infinity });
export const useProficiencyLevels = () => useQuery({ queryKey: ["masters", "proficiency"], queryFn: () => fetch<{id:string;level:string;scoreMultiplier:number}[]>("proficiency-levels"), staleTime: Infinity });
export const useCertifications = () => useQuery({ queryKey: ["masters", "certifications"], queryFn: () => fetch<{id:string;name:string;issuingBody:string}[]>("certifications"), staleTime: Infinity });
export const useExpTypes      = () => useQuery({ queryKey: ["masters", "exp-types"],     queryFn: () => fetch<{id:string;name:string}[]>("experience-types"),  staleTime: Infinity });
export const useOrgTypes      = () => useQuery({ queryKey: ["masters", "org-types"],     queryFn: () => fetch<{id:string;name:string}[]>("organization-types"), staleTime: Infinity });
export const useManagersList  = () => useQuery({ queryKey: ["masters", "managers"],      queryFn: () => fetch<{id:string;fullName:string;employeeCode:string;designation:{title:string}}[]>("employees-list"), staleTime: 60_000 });
