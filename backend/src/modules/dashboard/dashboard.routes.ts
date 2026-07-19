import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { prisma } from "../../lib/prisma";

const router = Router();
router.use(authenticate);

const ok = (res: import("express").Response, data: unknown) =>
  res.json({ success: true, data });

/**
 * GET /api/dashboard/stats
 * Returns KPI numbers for the dashboard.
 */
router.get("/stats", async (_req, res, next) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalActive,
      totalOnNotice,
      totalExited,
      recentJoins,
      deptBreakdown,
      bpvScores,
      topPerformers,
      recentBpv,
    ] = await prisma.$transaction([
      // 1. Active headcount
      prisma.employee.count({ where: { status: "ACTIVE", deletedAt: null } }),

      // 2. On-notice headcount
      prisma.employee.count({ where: { status: "ON_NOTICE", deletedAt: null } }),

      // 3. Exited headcount
      prisma.employee.count({ where: { status: "EXITED", deletedAt: null } }),

      // 4. Joined in last 30 days
      prisma.employee.count({
        where: { dateOfJoining: { gte: thirtyDaysAgo }, deletedAt: null },
      }),

      // 5. Department breakdown
      prisma.employee.groupBy({
        by: ["departmentId"],
        where: { status: "ACTIVE", deletedAt: null },
        _count: { id: true },
      }),

      // 6. Latest BPV score per employee (for distribution)
      prisma.$queryRaw<{ id: string; totalScore: number }[]>`
        SELECT DISTINCT ON (b."employeeId") b."employeeId" AS id, b."totalScore"
        FROM "BpvScore" b
        JOIN "Employee" e ON e.id = b."employeeId"
        WHERE e.status = 'ACTIVE' AND e."deletedAt" IS NULL
        ORDER BY b."employeeId", b."calculatedAt" DESC
      `,

      // 7. Top 5 performers
      prisma.$queryRaw<{
        id: string; fullName: string; totalScore: number;
        deptName: string; desigTitle: string; employeeCode: string;
      }[]>`
        SELECT DISTINCT ON (b."employeeId")
          e.id, e."fullName", e."employeeCode",
          b."totalScore",
          d.name AS "deptName",
          ds.title AS "desigTitle"
        FROM "BpvScore" b
        JOIN "Employee" e ON e.id = b."employeeId"
        JOIN "DepartmentMaster" d ON d.id = e."departmentId"
        JOIN "DesignationMaster" ds ON ds.id = e."designationId"
        WHERE e.status = 'ACTIVE' AND e."deletedAt" IS NULL
        ORDER BY b."employeeId", b."calculatedAt" DESC
      `,

      // 8. Recent BPV calculations (last 5 events)
      prisma.bpvScore.findMany({
        take: 5,
        orderBy: { calculatedAt: "desc" },
        include: {
          employee: { select: { fullName: true, employeeCode: true } },
        },
      }),
    ]);

    // Department name map
    const depts = await prisma.departmentMaster.findMany({
      select: { id: true, name: true },
    });
    const deptMap = Object.fromEntries(depts.map((d) => [d.id, d.name]));

    // Department breakdown with names
    const departmentData = deptBreakdown.map((d) => ({
      department: deptMap[d.departmentId] ?? d.departmentId,
      count: d._count.id,
    })).sort((a, b) => b.count - a.count);

    // BPV distribution buckets
    const scores = bpvScores.map((s) => Number(s.totalScore));
    const avgBpv = scores.length
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;
    const bpvDistribution = {
      green: scores.filter((s) => s >= 70).length,
      amber: scores.filter((s) => s >= 40 && s < 70).length,
      red:   scores.filter((s) => s < 40).length,
    };

    // Sort top performers descending by score
    const top5 = [...topPerformers]
      .sort((a, b) => Number(b.totalScore) - Number(a.totalScore))
      .slice(0, 5)
      .map((p) => ({ ...p, totalScore: Math.round(Number(p.totalScore)) }));

    ok(res, {
      headcount: {
        total:        totalActive + totalOnNotice + totalExited,
        active:       totalActive,
        onNotice:     totalOnNotice,
        exited:       totalExited,
        recentJoins,
      },
      avgBpv,
      bpvDistribution,
      departmentData,
      topPerformers: top5,
      recentBpvEvents: recentBpv.map((b) => ({
        employeeName: b.employee.fullName,
        employeeCode: b.employee.employeeCode,
        totalScore:   Math.round(Number(b.totalScore)),
        calculatedAt: b.calculatedAt,
      })),
    });
  } catch (e) {
    next(e);
  }
});

export default router;
