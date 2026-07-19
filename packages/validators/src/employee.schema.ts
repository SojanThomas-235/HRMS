import { z } from "zod";

/**
 * NOTE: IDs use z.string().min(1) rather than z.string().cuid()
 * because the seed / master data uses human-readable IDs like
 * "dept-tech", "desig-se", "prof-1", etc. — not auto-generated cuids.
 * Foreign-key integrity is enforced at the database level by Prisma.
 */

const id = () => z.string().min(1, "Required");

export const createEmployeeSchema = z.object({
  fullName:      z.string().min(2).max(100),
  email:         z.string().email(),
  dateOfBirth:   z.string().date().optional(),
  phone:         z.string().max(20).optional(),
  designationId: id(),
  departmentId:  id(),
  managerId:     id().optional(),
  dateOfJoining: z.string().date(),
  password:      z.string().min(8),
});

export const updateEmployeeSchema = z.object({
  fullName:      z.string().min(2).max(100).optional(),
  email:         z.string().email().optional(),
  phone:         z.string().max(20).optional(),
  dateOfBirth:   z.string().date().optional(),
  dateOfJoining: z.string().date().optional(),
  designationId: id().optional(),
  departmentId:  id().optional(),
  managerId:     id().optional(),
  status:        z.enum(["ACTIVE", "ON_NOTICE", "EXITED"]).optional(),
});

export const addQualificationSchema = z.object({
  qualificationTypeId: id(),
  institution:         z.string().min(2).max(200),
  yearOfCompletion:    z.number().int().min(1950).max(new Date().getFullYear()),
  grade:               z.string().max(50).optional(),
});

export const addExperienceSchema = z.object({
  organizationName:   z.string().min(2).max(200),
  organizationTypeId: id(),
  designationHeld:    z.string().min(2).max(100),
  startDate:          z.string().date(),
  endDate:            z.string().date().optional(),
  isCurrent:          z.boolean().default(false),
  domainId:           id().optional(),
  experienceTypes:    z.array(id()).min(1),
});

export const addSkillSchema = z.object({
  skillId:            id(),
  proficiencyLevelId: id(),
  yearsOfExperience:  z.number().min(0).max(50),
});

export const addCertificationSchema = z.object({
  certificationId: id(),
  issueDate:       z.string().date(),
  expiryDate:      z.string().date().optional(),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
export type AddQualificationInput = z.infer<typeof addQualificationSchema>;
export type AddExperienceInput = z.infer<typeof addExperienceSchema>;
export type AddSkillInput = z.infer<typeof addSkillSchema>;
export type AddCertificationInput = z.infer<typeof addCertificationSchema>;
