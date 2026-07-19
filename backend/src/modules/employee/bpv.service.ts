import { prisma } from "../../lib/prisma";
import { AppError } from "../../middleware/errorHandler";

export async function calculateBpv(
  employeeId: string,
  triggeredBy: string | undefined,
  triggerReason: string
) {
  // Active weight config
  const weightConfig = await prisma.bpvWeightConfig.findFirst({
    where: { isActive: true },
    orderBy: { effectiveFrom: "desc" },
  });
  if (!weightConfig) {
    throw new AppError(500, "CONFIG_MISSING", "No active BPV weight configuration found");
  }

  const employee = await prisma.employee.findUnique({
    where: { id: employeeId, deletedAt: null },
    include: {
      qualifications: {
        where: { verificationStatus: { not: "FLAGGED" } },
        include: { qualificationType: true },
      },
      experiences: {
        include: { organizationType: true },
      },
      skills: {
        include: { proficiencyLevel: true },
      },
      certifications: {
        where: { isExpired: false },
        include: { certification: true },
      },
    },
  });

  if (!employee) throw new AppError(404, "NOT_FOUND", "Employee not found");

  // ── 1. Education Score: max contribution from all qualifications ──────
  const educationScore = employee.qualifications.length > 0
    ? Math.max(...employee.qualifications.map((q) => q.qualificationType.scoreContribution))
    : 0;

  // ── 2. Experience Score: total years → band lookup ────────────────────
  const totalYears = employee.experiences.reduce(
    (sum, e) => sum + (e.yearsCalculated ?? 0), 0
  );

  const expBand = await prisma.experienceBandMaster.findFirst({
    where: {
      yearsFrom: { lte: totalYears },
      yearsTo:   { gte: totalYears },
      isActive:  true,
    },
  });
  const experienceScore = expBand?.scorePoints ?? 0;

  // ── 3. Org Profile Score: avg org-type score × 100, weighted ──────────
  const orgProfileScore = employee.experiences.length > 0
    ? (employee.experiences.reduce(
        (sum, e) => sum + e.organizationType.scoreContribution, 0
      ) / employee.experiences.length) * 100
    : 0;

  // ── 4. Skills Score: 25 base pts × proficiency multiplier, cap 100 ───
  const skillsRaw = employee.skills.reduce(
    (sum, es) => sum + 25 * es.proficiencyLevel.scoreMultiplier, 0
  );
  const skillScore = Math.min(100, skillsRaw);

  // ── 5. Cert Score: sum of cert contributions, cap 100 ─────────────────
  const certsRaw = employee.certifications.reduce(
    (sum, ec) => sum + ec.certification.scoreContribution, 0
  );
  const certScore = Math.min(100, certsRaw);

  // ── Final weighted BPV ─────────────────────────────────────────────────
  const raw =
    educationScore  * (weightConfig.educationPct  / 100) +
    experienceScore * (weightConfig.experiencePct / 100) +
    orgProfileScore * (weightConfig.orgProfilePct / 100) +
    skillScore      * (weightConfig.skillsPct     / 100) +
    certScore       * (weightConfig.certsPct      / 100);

  const finalScore = Math.round(Math.min(100, raw) * 100) / 100;

  const bpvScore = await prisma.bpvScore.create({
    data: {
      employeeId,
      score:          finalScore,
      educationScore,
      experienceScore,
      orgScore:       orgProfileScore,
      skillScore,
      certScore,
      configVersionId: weightConfig.id,
      triggerReason,
      triggeredBy: triggeredBy ?? "system",
      inputSnapshot: {
        totalYears,
        qualificationCount: employee.qualifications.length,
        skillCount:         employee.skills.length,
        certCount:          employee.certifications.length,
        experienceCount:    employee.experiences.length,
      },
    },
  });

  return bpvScore;
}
