import { Router, type Request, type Response, type NextFunction } from "express";
import { authenticate } from "../../middleware/authenticate";
import { authorize }    from "../../middleware/authorize";
import { prisma }       from "../../lib/prisma";
import { z }            from "zod";

const router = Router();
router.use(authenticate);

const ok  = (res: Response, data: unknown) => res.json({ success: true, data });
const ok201 = (res: Response, data: unknown) => res.status(201).json({ success: true, data });

// Only HR_ADMIN / SYSTEM_ADMIN may mutate master data
const adminOnly = authorize("HR_ADMIN", "SYSTEM_ADMIN");

const wrap = (fn: (req: Request, res: Response) => Promise<void>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try { await fn(req, res); } catch (e) { next(e); }
  };

// ══════════════════════════════════════════════════════════════════
// DEPARTMENTS
// ══════════════════════════════════════════════════════════════════

const deptSchema = z.object({
  name:        z.string().min(1).max(100),
  code:        z.string().min(1).max(20).toUpperCase(),
  description: z.string().max(300).optional(),
  isActive:    z.boolean().optional(),
});

router.get("/departments", wrap(async (_, res) => {
  ok(res, await prisma.departmentMaster.findMany({ orderBy: { name: "asc" } }));
}));

router.post("/departments", adminOnly, wrap(async (req, res) => {
  const data = deptSchema.parse(req.body);
  ok201(res, await prisma.departmentMaster.create({ data }));
}));

router.put("/departments/:id", adminOnly, wrap(async (req, res) => {
  const data = deptSchema.partial().parse(req.body);
  ok(res, await prisma.departmentMaster.update({ where: { id: req.params.id }, data }));
}));

router.delete("/departments/:id", adminOnly, wrap(async (req, res) => {
  // Soft-deactivate to avoid breaking existing employee records
  ok(res, await prisma.departmentMaster.update({ where: { id: req.params.id }, data: { isActive: false } }));
}));

// ══════════════════════════════════════════════════════════════════
// DESIGNATIONS
// ══════════════════════════════════════════════════════════════════

const desigSchema = z.object({
  title:    z.string().min(1).max(100),
  code:     z.string().min(1).max(20).toUpperCase(),
  grade:    z.string().max(20).optional(),
  isActive: z.boolean().optional(),
});

router.get("/designations", wrap(async (_, res) => {
  ok(res, await prisma.designationMaster.findMany({ orderBy: { title: "asc" } }));
}));

router.post("/designations", adminOnly, wrap(async (req, res) => {
  const data = desigSchema.parse(req.body);
  ok201(res, await prisma.designationMaster.create({ data }));
}));

router.put("/designations/:id", adminOnly, wrap(async (req, res) => {
  const data = desigSchema.partial().parse(req.body);
  ok(res, await prisma.designationMaster.update({ where: { id: req.params.id }, data }));
}));

router.delete("/designations/:id", adminOnly, wrap(async (req, res) => {
  ok(res, await prisma.designationMaster.update({ where: { id: req.params.id }, data: { isActive: false } }));
}));

// ══════════════════════════════════════════════════════════════════
// QUALIFICATION TYPES
// ══════════════════════════════════════════════════════════════════

const qualSchema = z.object({
  name:              z.string().min(1).max(100),
  code:              z.string().min(1).max(20).toUpperCase(),
  scoreContribution: z.number().min(0).max(100),
  sortOrder:         z.number().int().optional(),
  isActive:          z.boolean().optional(),
});

router.get("/qualifications", wrap(async (_, res) => {
  ok(res, await prisma.qualificationMaster.findMany({ orderBy: { sortOrder: "asc" } }));
}));

router.post("/qualifications", adminOnly, wrap(async (req, res) => {
  const data = qualSchema.parse(req.body);
  ok201(res, await prisma.qualificationMaster.create({ data }));
}));

router.put("/qualifications/:id", adminOnly, wrap(async (req, res) => {
  const data = qualSchema.partial().parse(req.body);
  ok(res, await prisma.qualificationMaster.update({ where: { id: req.params.id }, data }));
}));

router.delete("/qualifications/:id", adminOnly, wrap(async (req, res) => {
  ok(res, await prisma.qualificationMaster.update({ where: { id: req.params.id }, data: { isActive: false } }));
}));

// ══════════════════════════════════════════════════════════════════
// SKILL CATEGORIES
// ══════════════════════════════════════════════════════════════════

const skillCatSchema = z.object({
  name:     z.string().min(1).max(100),
  code:     z.string().min(1).max(20).toUpperCase(),
  isActive: z.boolean().optional(),
});

router.get("/skill-categories", wrap(async (_, res) => {
  ok(res, await prisma.skillCategoryMaster.findMany({
    include: { skills: { where: { isActive: true }, orderBy: { name: "asc" } } },
    orderBy: { name: "asc" },
  }));
}));

router.post("/skill-categories", adminOnly, wrap(async (req, res) => {
  const data = skillCatSchema.parse(req.body);
  ok201(res, await prisma.skillCategoryMaster.create({ data }));
}));

router.put("/skill-categories/:id", adminOnly, wrap(async (req, res) => {
  const data = skillCatSchema.partial().parse(req.body);
  ok(res, await prisma.skillCategoryMaster.update({ where: { id: req.params.id }, data }));
}));

router.delete("/skill-categories/:id", adminOnly, wrap(async (req, res) => {
  ok(res, await prisma.skillCategoryMaster.update({ where: { id: req.params.id }, data: { isActive: false } }));
}));

// ══════════════════════════════════════════════════════════════════
// SKILLS
// ══════════════════════════════════════════════════════════════════

const skillSchema = z.object({
  name:       z.string().min(1).max(100),
  code:       z.string().min(1).max(20).toUpperCase(),
  categoryId: z.string().min(1),
  isActive:   z.boolean().optional(),
});

router.get("/skills", wrap(async (_, res) => {
  ok(res, await prisma.skillMaster.findMany({
    include: { category: true },
    orderBy: { name: "asc" },
  }));
}));

router.post("/skills", adminOnly, wrap(async (req, res) => {
  const data = skillSchema.parse(req.body);
  ok201(res, await prisma.skillMaster.create({ data, include: { category: true } }));
}));

router.put("/skills/:id", adminOnly, wrap(async (req, res) => {
  const data = skillSchema.partial().parse(req.body);
  ok(res, await prisma.skillMaster.update({ where: { id: req.params.id }, data, include: { category: true } }));
}));

router.delete("/skills/:id", adminOnly, wrap(async (req, res) => {
  ok(res, await prisma.skillMaster.update({ where: { id: req.params.id }, data: { isActive: false } }));
}));

// ══════════════════════════════════════════════════════════════════
// PROFICIENCY LEVELS
// ══════════════════════════════════════════════════════════════════

const profSchema = z.object({
  level:           z.string().min(1).max(50),
  code:            z.string().min(1).max(20).toUpperCase(),
  sortOrder:       z.number().int(),
  scoreMultiplier: z.number().min(0).max(10),
  isActive:        z.boolean().optional(),
});

router.get("/proficiency-levels", wrap(async (_, res) => {
  ok(res, await prisma.skillProficiencyMaster.findMany({ orderBy: { sortOrder: "asc" } }));
}));

router.post("/proficiency-levels", adminOnly, wrap(async (req, res) => {
  const data = profSchema.parse(req.body);
  ok201(res, await prisma.skillProficiencyMaster.create({ data }));
}));

router.put("/proficiency-levels/:id", adminOnly, wrap(async (req, res) => {
  const data = profSchema.partial().parse(req.body);
  ok(res, await prisma.skillProficiencyMaster.update({ where: { id: req.params.id }, data }));
}));

router.delete("/proficiency-levels/:id", adminOnly, wrap(async (req, res) => {
  ok(res, await prisma.skillProficiencyMaster.update({ where: { id: req.params.id }, data: { isActive: false } }));
}));

// ══════════════════════════════════════════════════════════════════
// CERTIFICATIONS
// ══════════════════════════════════════════════════════════════════

const certSchema = z.object({
  name:              z.string().min(1).max(150),
  code:              z.string().min(1).max(20).toUpperCase(),
  issuingBody:       z.string().min(1).max(150),
  scoreContribution: z.number().min(0).max(100),
  hasExpiry:         z.boolean().optional(),
  expiryAlertDays:   z.number().int().min(0).optional(),
  isActive:          z.boolean().optional(),
});

router.get("/certifications", wrap(async (_, res) => {
  ok(res, await prisma.certificationMaster.findMany({ orderBy: { name: "asc" } }));
}));

router.post("/certifications", adminOnly, wrap(async (req, res) => {
  const data = certSchema.parse(req.body);
  ok201(res, await prisma.certificationMaster.create({ data }));
}));

router.put("/certifications/:id", adminOnly, wrap(async (req, res) => {
  const data = certSchema.partial().parse(req.body);
  ok(res, await prisma.certificationMaster.update({ where: { id: req.params.id }, data }));
}));

router.delete("/certifications/:id", adminOnly, wrap(async (req, res) => {
  ok(res, await prisma.certificationMaster.update({ where: { id: req.params.id }, data: { isActive: false } }));
}));

// ══════════════════════════════════════════════════════════════════
// EXPERIENCE TYPES
// ══════════════════════════════════════════════════════════════════

const expTypeSchema = z.object({
  name:     z.string().min(1).max(100),
  code:     z.string().min(1).max(20).toUpperCase(),
  isActive: z.boolean().optional(),
});

router.get("/experience-types", wrap(async (_, res) => {
  ok(res, await prisma.experienceTypeMaster.findMany({ orderBy: { name: "asc" } }));
}));

router.post("/experience-types", adminOnly, wrap(async (req, res) => {
  const data = expTypeSchema.parse(req.body);
  ok201(res, await prisma.experienceTypeMaster.create({ data }));
}));

router.put("/experience-types/:id", adminOnly, wrap(async (req, res) => {
  const data = expTypeSchema.partial().parse(req.body);
  ok(res, await prisma.experienceTypeMaster.update({ where: { id: req.params.id }, data }));
}));

router.delete("/experience-types/:id", adminOnly, wrap(async (req, res) => {
  ok(res, await prisma.experienceTypeMaster.update({ where: { id: req.params.id }, data: { isActive: false } }));
}));

// ══════════════════════════════════════════════════════════════════
// ORGANIZATION TYPES
// ══════════════════════════════════════════════════════════════════

const orgTypeSchema = z.object({
  name:              z.string().min(1).max(100),
  code:              z.string().min(1).max(20).toUpperCase(),
  scoreContribution: z.number().min(0).max(1),
  isActive:          z.boolean().optional(),
});

router.get("/organization-types", wrap(async (_, res) => {
  ok(res, await prisma.organizationTypeMaster.findMany({ orderBy: { name: "asc" } }));
}));

router.post("/organization-types", adminOnly, wrap(async (req, res) => {
  const data = orgTypeSchema.parse(req.body);
  ok201(res, await prisma.organizationTypeMaster.create({ data }));
}));

router.put("/organization-types/:id", adminOnly, wrap(async (req, res) => {
  const data = orgTypeSchema.partial().parse(req.body);
  ok(res, await prisma.organizationTypeMaster.update({ where: { id: req.params.id }, data }));
}));

router.delete("/organization-types/:id", adminOnly, wrap(async (req, res) => {
  ok(res, await prisma.organizationTypeMaster.update({ where: { id: req.params.id }, data: { isActive: false } }));
}));

// ══════════════════════════════════════════════════════════════════
// BPV WEIGHT CONFIG
// ══════════════════════════════════════════════════════════════════

const bpvSchema = z.object({
  educationPct:  z.number().min(0).max(100),
  experiencePct: z.number().min(0).max(100),
  orgProfilePct: z.number().min(0).max(100),
  skillsPct:     z.number().min(0).max(100),
  certsPct:      z.number().min(0).max(100),
  effectiveFrom: z.string().date(),
  changeReason:  z.string().min(1).max(300),
  createdBy:     z.string().min(1),
}).refine(
  (d) => d.educationPct + d.experiencePct + d.orgProfilePct + d.skillsPct + d.certsPct === 100,
  { message: "All percentages must sum to 100" }
);

router.get("/bpv-config", wrap(async (_, res) => {
  ok(res, await prisma.bpvWeightConfig.findMany({ orderBy: { effectiveFrom: "desc" } }));
}));

router.post("/bpv-config", adminOnly, wrap(async (req, res) => {
  const data = bpvSchema.parse(req.body);
  const result = await prisma.$transaction(async (tx) => {
    // Deactivate existing active configs
    await tx.bpvWeightConfig.updateMany({ where: { isActive: true }, data: { isActive: false } });
    return tx.bpvWeightConfig.create({ data: { ...data, isActive: true } });
  });
  ok201(res, result);
}));

// ══════════════════════════════════════════════════════════════════
// EXPERIENCE BANDS
// ══════════════════════════════════════════════════════════════════

const expBandSchema = z.object({
  yearsFrom:   z.number().min(0),
  yearsTo:     z.number().min(0),
  scorePoints: z.number().min(0).max(100),
  isActive:    z.boolean().optional(),
});

router.get("/experience-bands", wrap(async (_, res) => {
  ok(res, await prisma.experienceBandMaster.findMany({ orderBy: { yearsFrom: "asc" } }));
}));

router.post("/experience-bands", adminOnly, wrap(async (req, res) => {
  const data = expBandSchema.parse(req.body);
  ok201(res, await prisma.experienceBandMaster.create({ data }));
}));

router.put("/experience-bands/:id", adminOnly, wrap(async (req, res) => {
  const data = expBandSchema.partial().parse(req.body);
  ok(res, await prisma.experienceBandMaster.update({ where: { id: req.params.id }, data }));
}));

router.delete("/experience-bands/:id", adminOnly, wrap(async (req, res) => {
  ok(res, await prisma.experienceBandMaster.update({ where: { id: req.params.id }, data: { isActive: false } }));
}));

// ══════════════════════════════════════════════════════════════════
// EMPLOYEES LIST (lightweight dropdown)
// ══════════════════════════════════════════════════════════════════

router.get("/employees-list", wrap(async (req, res) => {
  ok(res, await prisma.employee.findMany({
    where: { deletedAt: null, status: "ACTIVE" },
    select: { id: true, fullName: true, employeeCode: true, designation: { select: { title: true } } },
    orderBy: { fullName: "asc" },
  }));
}));

export default router;
