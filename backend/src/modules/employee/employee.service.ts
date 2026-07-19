import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../middleware/errorHandler";
import { calculateBpv } from "./bpv.service";
import type {
  CreateEmployeeInput, UpdateEmployeeInput,
  AddQualificationInput, AddExperienceInput,
  AddSkillInput, AddCertificationInput,
} from "@hrms/validators";

// ── Helpers ────────────────────────────────────────────────────────────────────

async function nextEmployeeCode(): Promise<string> {
  const last = await prisma.employee.findFirst({
    orderBy: { employeeCode: "desc" },
    select: { employeeCode: true },
  });
  const num = last ? parseInt(last.employeeCode.replace("EMP", ""), 10) + 1 : 1;
  return `EMP${num.toString().padStart(6, "0")}`;
}

function calcYears(start: Date, end: Date | null): number {
  const to = end ?? new Date();
  const ms  = to.getTime() - start.getTime();
  return Math.round((ms / (1000 * 60 * 60 * 24 * 365.25)) * 100) / 100;
}

// ── List ───────────────────────────────────────────────────────────────────────

export async function listEmployees(params: {
  page: number;
  limit: number;
  search?: string;
  departmentId?: string;
  status?: string;
  /** When set, restricts results to direct reports of this employee (MANAGER scope) */
  managerId?: string;
}) {
  const { page, limit, search, departmentId, status, managerId } = params;
  const skip = (page - 1) * limit;

  const where = {
    deletedAt: null,
    ...(status     && { status: status as "ACTIVE" | "ON_NOTICE" | "EXITED" }),
    ...(departmentId && { departmentId }),
    ...(managerId  && { managerId }),
    ...(search && {
      OR: [
        { fullName:     { contains: search, mode: "insensitive" as const } },
        { email:        { contains: search, mode: "insensitive" as const } },
        { employeeCode: { contains: search, mode: "insensitive" as const } },
      ],
    }),
  };

  const [items, total] = await prisma.$transaction([
    prisma.employee.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        department:  { select: { id: true, name: true } },
        designation: { select: { id: true, title: true, grade: true } },
        manager:     { select: { id: true, fullName: true } },
        bpvScores:   { orderBy: { calculatedAt: "desc" }, take: 1, select: { score: true } },
      },
    }),
    prisma.employee.count({ where }),
  ]);

  return {
    items: items.map((e) => ({
      ...e,
      latestBpvScore: e.bpvScores[0]?.score ?? null,
      bpvScores: undefined,
    })),
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  };
}

// ── Get one ────────────────────────────────────────────────────────────────────

export async function getEmployee(id: string) {
  const emp = await prisma.employee.findFirst({
    where: { id, deletedAt: null },
    include: {
      department:  true,
      designation: true,
      manager:     { select: { id: true, fullName: true, employeeCode: true } },
      qualifications: {
        include: { qualificationType: true },
        orderBy: { yearOfCompletion: "desc" },
      },
      experiences: {
        include: {
          organizationType: true,
          experienceTypes:  { include: { experienceType: true } },
        },
        orderBy: { startDate: "desc" },
      },
      skills: {
        include: {
          skill:            { include: { category: true } },
          proficiencyLevel: true,
        },
        orderBy: { createdAt: "desc" },
      },
      certifications: {
        include: { certification: true },
        orderBy: { issueDate: "desc" },
      },
      bpvScores: {
        orderBy: { calculatedAt: "desc" },
        take: 10,
      },
    },
  });

  if (!emp) throw new AppError(404, "NOT_FOUND", "Employee not found");
  return emp;
}

// ── Create ─────────────────────────────────────────────────────────────────────

export async function createEmployee(data: CreateEmployeeInput, createdByUserId: string | undefined) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new AppError(409, "EMAIL_EXISTS", "A user with this email already exists");

  const employeeCode = await nextEmployeeCode();
  const passwordHash = await bcrypt.hash(data.password, 12);

  const employee = await prisma.$transaction(async (tx) => {
    const emp = await tx.employee.create({
      data: {
        employeeCode,
        fullName:     data.fullName,
        email:        data.email,
        phone:        data.phone,
        dateOfBirth:  data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        dateOfJoining: new Date(data.dateOfJoining),
        departmentId: data.departmentId,
        designationId: data.designationId,
        managerId:    data.managerId,
        status:       "ACTIVE",
      },
    });

    await tx.user.create({
      data: {
        email:        data.email,
        passwordHash,
        role:         "EMPLOYEE",
        employeeId:   emp.id,
        isActive:     true,
      },
    });

    await tx.auditLog.create({
      data: {
        actorId:  createdByUserId || undefined,
        module:   "EMPLOYEE",
        entity:   "Employee",
        entityId: emp.id,
        action:   "CREATE",
        newValue: { employeeCode, fullName: data.fullName, email: data.email },
        changeReason: "Employee onboarded",
      },
    });

    return emp;
  });

  // Calculate initial BPV (will be 0 until quals/exp/skills added, but record it)
  try {
    await calculateBpv(employee.id, createdByUserId, "EMPLOYEE_CREATED");
  } catch {
    // Non-fatal if no weight config
  }

  return getEmployee(employee.id);
}

// ── Update ─────────────────────────────────────────────────────────────────────

export async function updateEmployee(
  id: string,
  data: UpdateEmployeeInput,
  updatedByUserId: string | undefined
) {
  const existing = await prisma.employee.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new AppError(404, "NOT_FOUND", "Employee not found");

  await prisma.employee.update({
    where: { id },
    data: {
      fullName:      data.fullName,
      email:         data.email,
      phone:         data.phone,
      dateOfBirth:   data.dateOfBirth   ? new Date(data.dateOfBirth)   : undefined,
      dateOfJoining: data.dateOfJoining ? new Date(data.dateOfJoining) : undefined,
      departmentId:  data.departmentId,
      designationId: data.designationId,
      managerId:     data.managerId,
      status:        data.status,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId:  updatedByUserId || undefined,
      module:   "EMPLOYEE",
      entity:   "Employee",
      entityId: id,
      action:   "UPDATE",
      oldValue: existing,
      newValue: data,
    },
  });

  return getEmployee(id);
}

// ── Soft delete ────────────────────────────────────────────────────────────────

export async function deleteEmployee(id: string, deletedByUserId: string | undefined) {
  const existing = await prisma.employee.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new AppError(404, "NOT_FOUND", "Employee not found");

  await prisma.$transaction([
    prisma.employee.update({ where: { id }, data: { deletedAt: new Date(), status: "EXITED" } }),
    prisma.user.updateMany({ where: { employeeId: id }, data: { isActive: false } }),
    prisma.auditLog.create({
      data: {
        actorId: deletedByUserId || undefined,
        module:  "EMPLOYEE",
        entity:  "Employee",
        entityId: id,
        action:  "DELETE",
        changeReason: "Employee record deleted",
      },
    }),
  ]);
}

// ── Qualifications ─────────────────────────────────────────────────────────────

export async function addQualification(
  employeeId: string,
  data: AddQualificationInput,
  actorId: string | undefined
) {
  await ensureEmployeeExists(employeeId);

  const qual = await prisma.employeeQualification.create({
    data: {
      employeeId,
      qualificationTypeId: data.qualificationTypeId,
      institution:         data.institution,
      yearOfCompletion:    data.yearOfCompletion,
      grade:               data.grade,
    },
    include: { qualificationType: true },
  });

  await calculateBpv(employeeId, actorId, "QUALIFICATION_ADDED");
  return qual;
}

export async function deleteQualification(employeeId: string, qualId: string, actorId: string | undefined) {
  await ensureEmployeeExists(employeeId);
  await prisma.employeeQualification.deleteMany({ where: { id: qualId, employeeId } });
  await calculateBpv(employeeId, actorId, "QUALIFICATION_REMOVED");
}

// ── Experience ─────────────────────────────────────────────────────────────────

export async function addExperience(
  employeeId: string,
  data: AddExperienceInput,
  actorId: string | undefined
) {
  await ensureEmployeeExists(employeeId);

  const startDate = new Date(data.startDate);
  const endDate   = data.endDate ? new Date(data.endDate) : null;
  const yearsCalculated = calcYears(startDate, endDate);

  const exp = await prisma.employeeExperience.create({
    data: {
      employeeId,
      organizationName:   data.organizationName,
      organizationTypeId: data.organizationTypeId,
      designationHeld:    data.designationHeld,
      startDate,
      endDate,
      isCurrent:         data.isCurrent,
      yearsCalculated,
      experienceTypes: {
        create: data.experienceTypes.map((typeId) => ({ experienceTypeId: typeId })),
      },
    },
    include: {
      organizationType: true,
      experienceTypes:  { include: { experienceType: true } },
    },
  });

  await calculateBpv(employeeId, actorId, "EXPERIENCE_ADDED");
  return exp;
}

export async function deleteExperience(employeeId: string, expId: string, actorId: string | undefined) {
  await ensureEmployeeExists(employeeId);
  await prisma.employeeExperience.deleteMany({ where: { id: expId, employeeId } });
  await calculateBpv(employeeId, actorId, "EXPERIENCE_REMOVED");
}

// ── Skills ─────────────────────────────────────────────────────────────────────

export async function addSkill(
  employeeId: string,
  data: AddSkillInput,
  actorId: string | undefined
) {
  await ensureEmployeeExists(employeeId);

  const existing = await prisma.employeeSkill.findFirst({
    where: { employeeId, skillId: data.skillId },
  });

  const skill = existing
    ? await prisma.employeeSkill.update({
        where: { id: existing.id },
        data: { proficiencyLevelId: data.proficiencyLevelId, yearsOfExperience: data.yearsOfExperience },
        include: { skill: { include: { category: true } }, proficiencyLevel: true },
      })
    : await prisma.employeeSkill.create({
        data: { employeeId, ...data },
        include: { skill: { include: { category: true } }, proficiencyLevel: true },
      });

  await calculateBpv(employeeId, actorId, "SKILL_ADDED");
  return skill;
}

export async function deleteSkill(employeeId: string, skillId: string, actorId: string | undefined) {
  await ensureEmployeeExists(employeeId);
  await prisma.employeeSkill.deleteMany({ where: { id: skillId, employeeId } });
  await calculateBpv(employeeId, actorId, "SKILL_REMOVED");
}

// ── Certifications ─────────────────────────────────────────────────────────────

export async function addCertification(
  employeeId: string,
  data: AddCertificationInput,
  actorId: string | undefined
) {
  await ensureEmployeeExists(employeeId);

  const cert = await prisma.employeeCertification.create({
    data: {
      employeeId,
      certificationId: data.certificationId,
      issueDate:  new Date(data.issueDate),
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
      isExpired:  data.expiryDate ? new Date(data.expiryDate) < new Date() : false,
    },
    include: { certification: true },
  });

  await calculateBpv(employeeId, actorId, "CERTIFICATION_ADDED");
  return cert;
}

export async function deleteCertification(employeeId: string, certId: string, actorId: string | undefined) {
  await ensureEmployeeExists(employeeId);
  await prisma.employeeCertification.deleteMany({ where: { id: certId, employeeId } });
  await calculateBpv(employeeId, actorId, "CERTIFICATION_REMOVED");
}

// ── BPV History ────────────────────────────────────────────────────────────────

export async function getBpvHistory(employeeId: string) {
  await ensureEmployeeExists(employeeId);
  return prisma.bpvScore.findMany({
    where: { employeeId },
    orderBy: { calculatedAt: "desc" },
    take: 20,
  });
}

// ── Internal ───────────────────────────────────────────────────────────────────

async function ensureEmployeeExists(id: string) {
  const emp = await prisma.employee.findFirst({ where: { id, deletedAt: null } });
  if (!emp) throw new AppError(404, "NOT_FOUND", "Employee not found");
  return emp;
}
