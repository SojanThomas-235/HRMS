/**
 * HRMS Seed Script
 * Idempotent — safe to run multiple times.
 * Run: cd backend && bun prisma db seed
 *      (or: bun prisma/seed.ts)
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding HRMS database…\n");

  // ────────────────────────────────────────────────────────────────
  // 1. SESSION CONFIG
  // ────────────────────────────────────────────────────────────────
  await prisma.sessionConfig.upsert({
    where: { id: "session-default" },
    update: {},
    create: {
      id: "session-default",
      accessTokenTtlMinutes: 15,
      refreshTokenTtlDays: 7,
      maxLoginAttempts: 5,
      lockoutDurationMinutes: 30,
      effectiveFrom: new Date("2024-01-01"),
      isActive: true,
      changeReason: "Initial configuration",
      createdBy: "system",
    },
  });
  console.log("✓ SessionConfig");

  // ────────────────────────────────────────────────────────────────
  // 2. DEPARTMENTS
  // ────────────────────────────────────────────────────────────────
  const departments = [
    { id: "dept-tech",   name: "Technology",  code: "TECH" },
    { id: "dept-hr",     name: "Human Resources", code: "HR" },
    { id: "dept-fin",    name: "Finance",     code: "FIN" },
    { id: "dept-ops",    name: "Operations",  code: "OPS" },
    { id: "dept-mgmt",   name: "Management",  code: "MGMT" },
    { id: "dept-sales",  name: "Sales",       code: "SALES" },
    { id: "dept-legal",  name: "Legal",       code: "LEGAL" },
  ];

  for (const dept of departments) {
    await prisma.departmentMaster.upsert({
      where: { code: dept.code },
      update: { name: dept.name },
      create: dept,
    });
  }
  console.log(`✓ DepartmentMaster (${departments.length})`);

  // ────────────────────────────────────────────────────────────────
  // 3. DESIGNATIONS
  // ────────────────────────────────────────────────────────────────
  const designations = [
    { id: "desig-se",    title: "Software Engineer",        code: "SE",    grade: "B" },
    { id: "desig-sse",   title: "Senior Software Engineer", code: "SSE",   grade: "C" },
    { id: "desig-tl",    title: "Tech Lead",                code: "TL",    grade: "D" },
    { id: "desig-arch",  title: "Architect",                code: "ARCH",  grade: "E" },
    { id: "desig-pm",    title: "Project Manager",          code: "PM",    grade: "D" },
    { id: "desig-hrm",   title: "HR Manager",               code: "HRM",   grade: "D" },
    { id: "desig-hr",    title: "HR Executive",             code: "HRE",   grade: "B" },
    { id: "desig-fa",    title: "Finance Analyst",          code: "FA",    grade: "B" },
    { id: "desig-fm",    title: "Finance Manager",          code: "FM",    grade: "D" },
    { id: "desig-ops",   title: "Operations Executive",     code: "OE",    grade: "B" },
    { id: "desig-dir",   title: "Director",                 code: "DIR",   grade: "F" },
    { id: "desig-intern",title: "Intern",                   code: "INTERN",grade: "A" },
  ];

  for (const d of designations) {
    await prisma.designationMaster.upsert({
      where: { code: d.code },
      update: { title: d.title, grade: d.grade },
      create: d,
    });
  }
  console.log(`✓ DesignationMaster (${designations.length})`);

  // ────────────────────────────────────────────────────────────────
  // 4. QUALIFICATION MASTER
  // ────────────────────────────────────────────────────────────────
  const qualifications = [
    { id: "qual-hs",   name: "High School / 10+2",    code: "HS",   scoreContribution: 5,  sortOrder: 1 },
    { id: "qual-dip",  name: "Diploma",                code: "DIP",  scoreContribution: 10, sortOrder: 2 },
    { id: "qual-ug",   name: "Bachelor's Degree",      code: "UG",   scoreContribution: 20, sortOrder: 3 },
    { id: "qual-pg",   name: "Master's Degree",        code: "PG",   scoreContribution: 30, sortOrder: 4 },
    { id: "qual-mba",  name: "MBA",                    code: "MBA",  scoreContribution: 35, sortOrder: 5 },
    { id: "qual-phd",  name: "PhD / Doctorate",        code: "PHD",  scoreContribution: 50, sortOrder: 6 },
    { id: "qual-prof", name: "Professional Degree (CA/CFA/CS)", code: "PROF", scoreContribution: 40, sortOrder: 7 },
  ];

  for (const q of qualifications) {
    await prisma.qualificationMaster.upsert({
      where: { code: q.code },
      update: { name: q.name, scoreContribution: q.scoreContribution, sortOrder: q.sortOrder },
      create: q,
    });
  }
  console.log(`✓ QualificationMaster (${qualifications.length})`);

  // ────────────────────────────────────────────────────────────────
  // 5. EXPERIENCE BAND MASTER
  // ────────────────────────────────────────────────────────────────
  const expBands = [
    { id: "expband-1", yearsFrom: 0,  yearsTo: 1,  scorePoints: 5  },
    { id: "expband-2", yearsFrom: 1,  yearsTo: 3,  scorePoints: 15 },
    { id: "expband-3", yearsFrom: 3,  yearsTo: 5,  scorePoints: 25 },
    { id: "expband-4", yearsFrom: 5,  yearsTo: 8,  scorePoints: 35 },
    { id: "expband-5", yearsFrom: 8,  yearsTo: 12, scorePoints: 45 },
    { id: "expband-6", yearsFrom: 12, yearsTo: 20, scorePoints: 55 },
    { id: "expband-7", yearsFrom: 20, yearsTo: 99, scorePoints: 60 },
  ];

  for (const b of expBands) {
    await prisma.experienceBandMaster.upsert({
      where: { id: b.id },
      update: { scorePoints: b.scorePoints },
      create: b,
    });
  }
  console.log(`✓ ExperienceBandMaster (${expBands.length})`);

  // ────────────────────────────────────────────────────────────────
  // 6. EXPERIENCE TYPE MASTER
  // ────────────────────────────────────────────────────────────────
  const expTypes = [
    { id: "exptype-tech",  name: "Technical",   code: "TECH",   weightContribution: 1.0 },
    { id: "exptype-mgmt",  name: "Managerial",  code: "MGMT",   weightContribution: 0.9 },
    { id: "exptype-dom",   name: "Domain",      code: "DOMAIN", weightContribution: 0.8 },
    { id: "exptype-res",   name: "Research",    code: "RESEARCH", weightContribution: 0.7 },
    { id: "exptype-cons",  name: "Consulting",  code: "CONSULT", weightContribution: 0.8 },
  ];

  for (const et of expTypes) {
    await prisma.experienceTypeMaster.upsert({
      where: { code: et.code },
      update: { name: et.name, weightContribution: et.weightContribution },
      create: et,
    });
  }
  console.log(`✓ ExperienceTypeMaster (${expTypes.length})`);

  // ────────────────────────────────────────────────────────────────
  // 7. ORGANISATION TYPE MASTER
  // ────────────────────────────────────────────────────────────────
  const orgTypes = [
    { id: "orgtype-mnc",   name: "MNC / Large Enterprise", code: "MNC",     scoreContribution: 1.0 },
    { id: "orgtype-mid",   name: "Mid-size Company",        code: "MIDSZ",   scoreContribution: 0.85 },
    { id: "orgtype-start", name: "Startup",                 code: "STARTUP", scoreContribution: 0.75 },
    { id: "orgtype-govt",  name: "Government / PSU",        code: "GOVT",    scoreContribution: 0.9 },
    { id: "orgtype-ngo",   name: "NGO / Non-profit",        code: "NGO",     scoreContribution: 0.7 },
    { id: "orgtype-self",  name: "Self-employed / Freelance", code: "SELF",  scoreContribution: 0.65 },
  ];

  for (const ot of orgTypes) {
    await prisma.organizationTypeMaster.upsert({
      where: { code: ot.code },
      update: { name: ot.name, scoreContribution: ot.scoreContribution },
      create: ot,
    });
  }
  console.log(`✓ OrganizationTypeMaster (${orgTypes.length})`);

  // ────────────────────────────────────────────────────────────────
  // 8. SKILL CATEGORY + SKILL MASTER
  // ────────────────────────────────────────────────────────────────
  const skillCategories = [
    { id: "sc-prog",   name: "Programming Languages", code: "PROG" },
    { id: "sc-cloud",  name: "Cloud & DevOps",        code: "CLOUD" },
    { id: "sc-db",     name: "Databases",             code: "DB" },
    { id: "sc-fe",     name: "Frontend",              code: "FE" },
    { id: "sc-be",     name: "Backend & Frameworks",  code: "BE" },
    { id: "sc-soft",   name: "Soft Skills",           code: "SOFT" },
    { id: "sc-mgmt",   name: "Management",            code: "MGMT" },
    { id: "sc-data",   name: "Data & Analytics",      code: "DATA" },
  ];

  for (const sc of skillCategories) {
    await prisma.skillCategoryMaster.upsert({
      where: { code: sc.code },
      update: { name: sc.name },
      create: sc,
    });
  }

  const skills = [
    // Programming
    { id: "sk-ts",    name: "TypeScript",    code: "TS",    categoryId: "sc-prog" },
    { id: "sk-py",    name: "Python",        code: "PY",    categoryId: "sc-prog" },
    { id: "sk-java",  name: "Java",          code: "JAVA",  categoryId: "sc-prog" },
    { id: "sk-go",    name: "Go",            code: "GO",    categoryId: "sc-prog" },
    { id: "sk-rust",  name: "Rust",          code: "RUST",  categoryId: "sc-prog" },
    // Cloud
    { id: "sk-aws",   name: "AWS",           code: "AWS",   categoryId: "sc-cloud" },
    { id: "sk-gcp",   name: "Google Cloud",  code: "GCP",   categoryId: "sc-cloud" },
    { id: "sk-az",    name: "Azure",         code: "AZ",    categoryId: "sc-cloud" },
    { id: "sk-docker",name: "Docker",        code: "DOCKER",categoryId: "sc-cloud" },
    { id: "sk-k8s",   name: "Kubernetes",    code: "K8S",   categoryId: "sc-cloud" },
    // Databases
    { id: "sk-pg",    name: "PostgreSQL",    code: "PG",    categoryId: "sc-db" },
    { id: "sk-mongo", name: "MongoDB",       code: "MONGO", categoryId: "sc-db" },
    { id: "sk-redis", name: "Redis",         code: "REDIS", categoryId: "sc-db" },
    // Frontend
    { id: "sk-react", name: "React",         code: "REACT", categoryId: "sc-fe" },
    { id: "sk-next",  name: "Next.js",       code: "NEXT",  categoryId: "sc-fe" },
    { id: "sk-vue",   name: "Vue.js",        code: "VUE",   categoryId: "sc-fe" },
    // Backend
    { id: "sk-node",  name: "Node.js",       code: "NODE",  categoryId: "sc-be" },
    { id: "sk-expr",  name: "Express.js",    code: "EXPRESS",categoryId: "sc-be" },
    // Soft Skills
    { id: "sk-comm",  name: "Communication", code: "COMM",  categoryId: "sc-soft" },
    { id: "sk-lead",  name: "Leadership",    code: "LEAD",  categoryId: "sc-soft" },
    { id: "sk-prob",  name: "Problem Solving",code: "PROB", categoryId: "sc-soft" },
    // Management
    { id: "sk-pm",    name: "Project Management", code: "PM", categoryId: "sc-mgmt" },
    { id: "sk-agile", name: "Agile / Scrum", code: "AGILE", categoryId: "sc-mgmt" },
    // Data
    { id: "sk-sql",   name: "SQL",           code: "SQL",   categoryId: "sc-data" },
    { id: "sk-bi",    name: "Business Intelligence", code: "BI", categoryId: "sc-data" },
  ];

  for (const s of skills) {
    await prisma.skillMaster.upsert({
      where: { code: s.code },
      update: { name: s.name, categoryId: s.categoryId },
      create: s,
    });
  }
  console.log(`✓ SkillCategoryMaster (${skillCategories.length}) + SkillMaster (${skills.length})`);

  // ────────────────────────────────────────────────────────────────
  // 9. SKILL PROFICIENCY MASTER
  // ────────────────────────────────────────────────────────────────
  const proficiencies = [
    { id: "prof-1", level: "Beginner",     code: "BEG",  sortOrder: 1, scoreMultiplier: 0.25 },
    { id: "prof-2", level: "Intermediate", code: "INT",  sortOrder: 2, scoreMultiplier: 0.5  },
    { id: "prof-3", level: "Advanced",     code: "ADV",  sortOrder: 3, scoreMultiplier: 0.75 },
    { id: "prof-4", level: "Expert",       code: "EXP",  sortOrder: 4, scoreMultiplier: 1.0  },
  ];

  for (const p of proficiencies) {
    await prisma.skillProficiencyMaster.upsert({
      where: { code: p.code },
      update: { level: p.level, sortOrder: p.sortOrder, scoreMultiplier: p.scoreMultiplier },
      create: p,
    });
  }
  console.log(`✓ SkillProficiencyMaster (${proficiencies.length})`);

  // ────────────────────────────────────────────────────────────────
  // 10. CERTIFICATION MASTER
  // ────────────────────────────────────────────────────────────────
  const certs = [
    { id: "cert-awssa",  name: "AWS Solutions Architect",       code: "AWS-SA",  issuingBody: "Amazon",    scoreContribution: 15, hasExpiry: true,  expiryAlertDays: 90 },
    { id: "cert-awsdv",  name: "AWS Developer Associate",       code: "AWS-DEV", issuingBody: "Amazon",    scoreContribution: 12, hasExpiry: true,  expiryAlertDays: 90 },
    { id: "cert-gcp",    name: "Google Cloud Professional",     code: "GCP-PRO", issuingBody: "Google",    scoreContribution: 15, hasExpiry: true,  expiryAlertDays: 90 },
    { id: "cert-az900",  name: "Azure Fundamentals (AZ-900)",   code: "AZ-900",  issuingBody: "Microsoft", scoreContribution: 8,  hasExpiry: false, expiryAlertDays: 60 },
    { id: "cert-pmp",    name: "PMP Certification",             code: "PMP",     issuingBody: "PMI",       scoreContribution: 20, hasExpiry: true,  expiryAlertDays: 90 },
    { id: "cert-cka",    name: "Certified Kubernetes Admin",    code: "CKA",     issuingBody: "CNCF",      scoreContribution: 18, hasExpiry: true,  expiryAlertDays: 90 },
    { id: "cert-scrum",  name: "Certified Scrum Master",        code: "CSM",     issuingBody: "Scrum Alliance", scoreContribution: 10, hasExpiry: true, expiryAlertDays: 60 },
    { id: "cert-ca",     name: "Chartered Accountant (CA)",     code: "CA",      issuingBody: "ICAI",      scoreContribution: 30, hasExpiry: false, expiryAlertDays: 60 },
    { id: "cert-cfa",    name: "CFA Charter",                   code: "CFA",     issuingBody: "CFA Institute", scoreContribution: 25, hasExpiry: false, expiryAlertDays: 60 },
    { id: "cert-iso",    name: "ISO 27001 Lead Implementer",    code: "ISO-27001",issuingBody: "BSI",       scoreContribution: 12, hasExpiry: true,  expiryAlertDays: 90 },
  ];

  for (const c of certs) {
    await prisma.certificationMaster.upsert({
      where: { code: c.code },
      update: { name: c.name, scoreContribution: c.scoreContribution },
      create: c,
    });
  }
  console.log(`✓ CertificationMaster (${certs.length})`);

  // ────────────────────────────────────────────────────────────────
  // 11. BPV WEIGHT CONFIG
  // ────────────────────────────────────────────────────────────────
  await prisma.bpvWeightConfig.upsert({
    where: { id: "bpv-v1" },
    update: {},
    create: {
      id: "bpv-v1",
      educationPct:  20,
      experiencePct: 30,
      orgProfilePct: 10,
      skillsPct:     25,
      certsPct:      15,
      effectiveFrom: new Date("2024-01-01"),
      isActive:      true,
      changeReason:  "Initial BPV weight configuration",
      createdBy:     "system",
    },
  });
  console.log("✓ BpvWeightConfig");

  // ────────────────────────────────────────────────────────────────
  // 12. SALARY GRADE MASTER
  // ────────────────────────────────────────────────────────────────
  const salaryGrades = [
    { id: "grade-a", grade: "A", component1Pct: 85, component2Pct: 15, component2Rate: 150 },
    { id: "grade-b", grade: "B", component1Pct: 82, component2Pct: 18, component2Rate: 180 },
    { id: "grade-c", grade: "C", component1Pct: 80, component2Pct: 20, component2Rate: 220 },
    { id: "grade-d", grade: "D", component1Pct: 78, component2Pct: 22, component2Rate: 270 },
    { id: "grade-e", grade: "E", component1Pct: 75, component2Pct: 25, component2Rate: 350 },
    { id: "grade-f", grade: "F", component1Pct: 70, component2Pct: 30, component2Rate: 450 },
  ];

  for (const g of salaryGrades) {
    await prisma.salaryGradeMaster.upsert({
      where: { grade: g.grade },
      update: {},
      create: {
        ...g,
        effectiveFrom: new Date("2024-01-01"),
        isActive:      true,
        changeReason:  "Initial salary grade configuration",
        createdBy:     "system",
      },
    });
  }

  // Salary bands per grade (BPV range → salary range in INR)
  const salaryBands = [
    { id: "sb-a-1",  gradeId: "grade-a", bpvScoreFrom: 0,   bpvScoreTo: 30,  salaryFrom: 300000,  salaryTo: 500000  },
    { id: "sb-b-1",  gradeId: "grade-b", bpvScoreFrom: 25,  bpvScoreTo: 50,  salaryFrom: 500000,  salaryTo: 900000  },
    { id: "sb-c-1",  gradeId: "grade-c", bpvScoreFrom: 45,  bpvScoreTo: 70,  salaryFrom: 900000,  salaryTo: 1500000 },
    { id: "sb-d-1",  gradeId: "grade-d", bpvScoreFrom: 65,  bpvScoreTo: 85,  salaryFrom: 1500000, salaryTo: 2500000 },
    { id: "sb-e-1",  gradeId: "grade-e", bpvScoreFrom: 80,  bpvScoreTo: 95,  salaryFrom: 2500000, salaryTo: 4000000 },
    { id: "sb-f-1",  gradeId: "grade-f", bpvScoreFrom: 90,  bpvScoreTo: 100, salaryFrom: 4000000, salaryTo: 8000000 },
  ];

  for (const sb of salaryBands) {
    await prisma.salaryBandMaster.upsert({
      where: { id: sb.id },
      update: {},
      create: {
        ...sb,
        currency:     "INR",
        effectiveFrom: new Date("2024-01-01"),
        isActive:     true,
        changeReason: "Initial salary band",
        createdBy:    "system",
      },
    });
  }
  console.log(`✓ SalaryGradeMaster (${salaryGrades.length}) + SalaryBandMaster (${salaryBands.length})`);

  // ────────────────────────────────────────────────────────────────
  // 13. REVIEW CYCLE CONFIG
  // ────────────────────────────────────────────────────────────────
  await prisma.reviewCycleConfig.upsert({
    where: { id: "rc-default" },
    update: {},
    create: {
      id:           "rc-default",
      cycleType:    "QUARTERLY",
      effectiveFrom: new Date("2024-01-01"),
      isActive:     true,
      changeReason: "Default quarterly review cycle",
      createdBy:    "system",
    },
  });
  console.log("✓ ReviewCycleConfig");

  // ────────────────────────────────────────────────────────────────
  // 14. TASK CATEGORY MASTER
  // ────────────────────────────────────────────────────────────────
  const taskCategories = [
    { id: "tc-dev",     name: "Software Development", code: "DEV",     benchmarkHours: 8  },
    { id: "tc-design",  name: "UI/UX Design",         code: "DESIGN",  benchmarkHours: 6  },
    { id: "tc-analysis",name: "Business Analysis",    code: "BA",      benchmarkHours: 4  },
    { id: "tc-testing", name: "QA / Testing",         code: "QA",      benchmarkHours: 6  },
    { id: "tc-docs",    name: "Documentation",         code: "DOCS",    benchmarkHours: 3  },
    { id: "tc-devops",  name: "DevOps / Infra",       code: "DEVOPS",  benchmarkHours: 5  },
    { id: "tc-support", name: "Support / Bug Fix",    code: "SUPPORT", benchmarkHours: 4  },
    { id: "tc-mgmt",    name: "Management / Planning",code: "MGMT",    benchmarkHours: 4  },
    { id: "tc-research",name: "Research & Innovation",code: "RESEARCH",benchmarkHours: 6  },
  ];

  for (const tc of taskCategories) {
    await prisma.taskCategoryMaster.upsert({
      where: { code: tc.code },
      update: { name: tc.name, benchmarkHours: tc.benchmarkHours },
      create: tc,
    });
  }
  console.log(`✓ TaskCategoryMaster (${taskCategories.length})`);

  // ────────────────────────────────────────────────────────────────
  // 15. QUALITY RATING MASTER
  // ────────────────────────────────────────────────────────────────
  const qualityRatings = [
    { id: "qr-1", label: "Poor",        numericValue: 1, sortOrder: 1 },
    { id: "qr-2", label: "Below Average", numericValue: 2, sortOrder: 2 },
    { id: "qr-3", label: "Average",     numericValue: 3, sortOrder: 3 },
    { id: "qr-4", label: "Good",        numericValue: 4, sortOrder: 4 },
    { id: "qr-5", label: "Excellent",   numericValue: 5, sortOrder: 5 },
  ];

  for (const qr of qualityRatings) {
    await prisma.qualityRatingMaster.upsert({
      where: { label: qr.label },
      update: { numericValue: qr.numericValue, sortOrder: qr.sortOrder },
      create: qr,
    });
  }
  console.log(`✓ QualityRatingMaster (${qualityRatings.length})`);

  // ────────────────────────────────────────────────────────────────
  // 16. QUALITY CRITERIA MASTER (per task category)
  // ────────────────────────────────────────────────────────────────
  const qualityCriteria = [
    { id: "qc-dev-1",  categoryId: "tc-dev",    criteriaText: "Code follows agreed standards and passes linting",  sortOrder: 1 },
    { id: "qc-dev-2",  categoryId: "tc-dev",    criteriaText: "Unit tests written and all pass",                   sortOrder: 2 },
    { id: "qc-dev-3",  categoryId: "tc-dev",    criteriaText: "No regression in existing tests",                   sortOrder: 3 },
    { id: "qc-dev-4",  categoryId: "tc-dev",    criteriaText: "Code reviewed and approved by a peer",              sortOrder: 4 },
    { id: "qc-qa-1",   categoryId: "tc-testing",criteriaText: "Test plan documented and followed",                 sortOrder: 1 },
    { id: "qc-qa-2",   categoryId: "tc-testing",criteriaText: "All agreed scenarios covered",                      sortOrder: 2 },
    { id: "qc-qa-3",   categoryId: "tc-testing",criteriaText: "Defects logged with clear reproduction steps",      sortOrder: 3 },
    { id: "qc-docs-1", categoryId: "tc-docs",   criteriaText: "Document is complete and approved by stakeholder",  sortOrder: 1 },
    { id: "qc-docs-2", categoryId: "tc-docs",   criteriaText: "No broken links or missing references",             sortOrder: 2 },
    { id: "qc-ba-1",   categoryId: "tc-analysis",criteriaText:"Requirements signed off by product owner",          sortOrder: 1 },
    { id: "qc-ba-2",   categoryId: "tc-analysis",criteriaText:"Edge cases and exceptions documented",              sortOrder: 2 },
  ];

  for (const qc of qualityCriteria) {
    await prisma.qualityCriteriaMaster.upsert({
      where: { id: qc.id },
      update: { criteriaText: qc.criteriaText },
      create: qc,
    });
  }
  console.log(`✓ QualityCriteriaMaster (${qualityCriteria.length})`);

  // ────────────────────────────────────────────────────────────────
  // 17. TIME BLOCK MASTER
  // ────────────────────────────────────────────────────────────────
  const timeBlocks = [
    { id: "tb-1",  label: "1 Hour",       hours: 1,  sortOrder: 1 },
    { id: "tb-2",  label: "2 Hours",      hours: 2,  sortOrder: 2 },
    { id: "tb-3",  label: "3 Hours",      hours: 3,  sortOrder: 3 },
    { id: "tb-4",  label: "4 Hours",      hours: 4,  sortOrder: 4 },
    { id: "tb-6",  label: "6 Hours",      hours: 6,  sortOrder: 5 },
    { id: "tb-8",  label: "Full Day (8h)",hours: 8,  sortOrder: 6 },
  ];

  for (const tb of timeBlocks) {
    await prisma.timeBlockMaster.upsert({
      where: { id: tb.id },
      update: { label: tb.label, hours: tb.hours },
      create: tb,
    });
  }
  console.log(`✓ TimeBlockMaster (${timeBlocks.length})`);

  // ────────────────────────────────────────────────────────────────
  // 18. EFFICIENCY WEIGHT CONFIG
  // ────────────────────────────────────────────────────────────────
  await prisma.efficiencyWeightConfig.upsert({
    where: { id: "eff-v1" },
    update: {},
    create: {
      id:                "eff-v1",
      completionRatePct: 40,
      qualityScorePct:   40,
      timeEfficiencyPct: 20,
      effectiveFrom:     new Date("2024-01-01"),
      isActive:          true,
      changeReason:      "Initial efficiency weight configuration",
      createdBy:         "system",
    },
  });
  console.log("✓ EfficiencyWeightConfig");

  // ────────────────────────────────────────────────────────────────
  // 19. EFFICIENCY TIER MASTER
  // ────────────────────────────────────────────────────────────────
  const effTiers = [
    { id: "tier-1", tierName: "Developing",   scoreFrom: 0,  scoreTo: 40,  incentivePct: 0,   sortOrder: 1 },
    { id: "tier-2", tierName: "Performing",   scoreFrom: 40, scoreTo: 65,  incentivePct: 5,   sortOrder: 2 },
    { id: "tier-3", tierName: "Exceeding",    scoreFrom: 65, scoreTo: 85,  incentivePct: 10,  sortOrder: 3 },
    { id: "tier-4", tierName: "Outstanding",  scoreFrom: 85, scoreTo: 100, incentivePct: 20,  sortOrder: 4 },
  ];

  for (const et of effTiers) {
    await prisma.efficiencyTierMaster.upsert({
      where: { id: et.id },
      update: { tierName: et.tierName, incentivePct: et.incentivePct },
      create: et,
    });
  }
  console.log(`✓ EfficiencyTierMaster (${effTiers.length})`);

  // ────────────────────────────────────────────────────────────────
  // 20. ASSET TYPE MASTER
  // ────────────────────────────────────────────────────────────────
  const assetTypes = [
    { id: "at-doc",    name: "Document",          code: "DOC",     description: "Word docs, PDFs, reports" },
    { id: "at-code",   name: "Code / Repository", code: "CODE",    description: "Source code, scripts, libraries" },
    { id: "at-design", name: "Design Asset",      code: "DESIGN",  description: "Figma, wireframes, mockups" },
    { id: "at-data",   name: "Data Set",          code: "DATASET", description: "Structured data, spreadsheets" },
    { id: "at-proc",   name: "Process / SOP",     code: "PROCESS", description: "Standard operating procedures" },
    { id: "at-train",  name: "Training Material", code: "TRAINING",description: "Presentations, videos, guides" },
    { id: "at-research",name:"Research Output",   code: "RESEARCH",description: "Research papers, analyses" },
  ];

  for (const at of assetTypes) {
    await prisma.assetTypeMaster.upsert({
      where: { code: at.code },
      update: { name: at.name, description: at.description },
      create: at,
    });
  }
  console.log(`✓ AssetTypeMaster (${assetTypes.length})`);

  // ────────────────────────────────────────────────────────────────
  // 21. DOCUMENTATION TYPE MASTER
  // ────────────────────────────────────────────────────────────────
  const docTypes = [
    { id: "dt-readme",  name: "README",               code: "README"   },
    { id: "dt-req",     name: "Requirements Document", code: "REQS"     },
    { id: "dt-design",  name: "Design Document",       code: "DESIGN"   },
    { id: "dt-test",    name: "Test Plan",             code: "TESTPLAN" },
    { id: "dt-api",     name: "API Documentation",     code: "APIDOC"   },
    { id: "dt-user",    name: "User Guide",            code: "USERGUIDE"},
    { id: "dt-release", name: "Release Notes",         code: "RELEASE"  },
    { id: "dt-arch",    name: "Architecture Document", code: "ARCH"     },
  ];

  for (const dt of docTypes) {
    await prisma.documentationTypeMaster.upsert({
      where: { code: dt.code },
      update: { name: dt.name },
      create: dt,
    });
  }
  console.log(`✓ DocumentationTypeMaster (${docTypes.length})`);

  // Doc requirements: CODE assets must have README + API docs
  const docRequirements = [
    { id: "dr-code-readme", assetTypeId: "at-code", docTypeId: "dt-readme",  isMandatory: true },
    { id: "dr-code-api",    assetTypeId: "at-code", docTypeId: "dt-api",     isMandatory: false },
    { id: "dr-doc-reqs",    assetTypeId: "at-doc",  docTypeId: "dt-req",     isMandatory: false },
    { id: "dr-proc-user",   assetTypeId: "at-proc", docTypeId: "dt-user",    isMandatory: true  },
  ];

  for (const dr of docRequirements) {
    await prisma.docRequirementConfig.upsert({
      where: { id: dr.id },
      update: {},
      create: {
        ...dr,
        effectiveFrom: new Date("2024-01-01"),
        isActive:      true,
        changeReason:  "Initial doc requirement",
        createdBy:     "system",
      },
    });
  }
  console.log(`✓ DocRequirementConfig (${docRequirements.length})`);

  // Compliance threshold: 80% docs needed or flag
  await prisma.complianceThresholdConfig.upsert({
    where: { id: "ctc-default" },
    update: {},
    create: {
      id:            "ctc-default",
      thresholdPct:  80,
      action:        "FLAG_ONLY",
      effectiveFrom: new Date("2024-01-01"),
      isActive:      true,
      changeReason:  "Default compliance threshold",
      createdBy:     "system",
    },
  });
  console.log("✓ ComplianceThresholdConfig");

  // ────────────────────────────────────────────────────────────────
  // 22. REWARD TYPE + BASIS MASTER
  // ────────────────────────────────────────────────────────────────
  const rewardTypes = [
    { id: "rt-ip",   name: "IP / Innovation Reward", code: "IP_REWARD",   description: "Reward for patents, proprietary innovations" },
    { id: "rt-exc",  name: "Excellence Award",        code: "EXCELLENCE",  description: "Outstanding performance recognition" },
    { id: "rt-cont", name: "Contribution Bonus",      code: "CONTRIBUTION",description: "Monetary bonus for significant asset contributions" },
  ];

  for (const rt of rewardTypes) {
    await prisma.rewardTypeMaster.upsert({
      where: { code: rt.code },
      update: { name: rt.name },
      create: rt,
    });
  }

  const rewardBases = [
    { id: "rb-val",  name: "Asset Market Value",    code: "ASSET_VALUE"   },
    { id: "rb-dir",  name: "Direct Contribution",   code: "DIRECT_CONTRIB"},
    { id: "rb-team", name: "Team Contribution",     code: "TEAM_CONTRIB"  },
  ];

  for (const rb of rewardBases) {
    await prisma.rewardBasisMaster.upsert({
      where: { code: rb.code },
      update: { name: rb.name },
      create: rb,
    });
  }
  console.log(`✓ RewardTypeMaster (${rewardTypes.length}) + RewardBasisMaster (${rewardBases.length})`);

  // Reward formula config
  await prisma.rewardFormulaConfig.upsert({
    where: { id: "rfc-ip-v1" },
    update: {},
    create: {
      id:           "rfc-ip-v1",
      rewardTypeId: "rt-ip",
      formulaDescription: "3% of documented asset value, split between creator and contributors",
      parameters:   { splitRatio: { creator: 60, contributors: 40 }, maxPctOfValue: 3 },
      effectiveFrom: new Date("2024-01-01"),
      isActive:     true,
      changeReason: "Initial IP reward formula",
      createdBy:    "system",
    },
  });

  // Contribution split config
  await prisma.rewardContributionConfig.upsert({
    where: { id: "rcc-default" },
    update: {},
    create: {
      id:            "rcc-default",
      splitMethod:   "BY_ROLE",
      creatorPct:    60,
      contributorPct:40,
      effectiveFrom: new Date("2024-01-01"),
      isActive:      true,
      changeReason:  "Default contribution split",
      createdBy:     "system",
    },
  });

  // Reward cap config
  await prisma.rewardCapConfig.upsert({
    where: { id: "rcc-cap-1" },
    update: {},
    create: {
      id:              "rcc-cap-1",
      maxAmountPerYear: 500000,
      currency:        "INR",
      effectiveFrom:   new Date("2024-01-01"),
      isActive:        true,
      changeReason:    "Default annual reward cap",
      createdBy:       "system",
    },
  });
  console.log("✓ RewardFormulaConfig + RewardContributionConfig + RewardCapConfig");

  // ────────────────────────────────────────────────────────────────
  // 23. BENEFICIARY TYPE MASTER
  // ────────────────────────────────────────────────────────────────
  const beneficiaryTypes = [
    { id: "bt-spouse",  name: "Spouse",          code: "SPOUSE"   },
    { id: "bt-child",   name: "Child",           code: "CHILD"    },
    { id: "bt-parent",  name: "Parent",          code: "PARENT"   },
    { id: "bt-sibling", name: "Sibling",         code: "SIBLING"  },
    { id: "bt-other",   name: "Other Dependent", code: "OTHER"    },
  ];

  for (const bt of beneficiaryTypes) {
    await prisma.beneficiaryTypeMaster.upsert({
      where: { code: bt.code },
      update: { name: bt.name },
      create: bt,
    });
  }

  // Required docs per beneficiary type
  const beneDocConfigs = [
    { id: "bdc-sp-1",  beneficiaryTypeId: "bt-spouse",  docName: "Marriage Certificate",       isMandatory: true  },
    { id: "bdc-sp-2",  beneficiaryTypeId: "bt-spouse",  docName: "Government ID Proof",        isMandatory: true  },
    { id: "bdc-ch-1",  beneficiaryTypeId: "bt-child",   docName: "Birth Certificate",          isMandatory: true  },
    { id: "bdc-ch-2",  beneficiaryTypeId: "bt-child",   docName: "Adoption Certificate",       isMandatory: false },
    { id: "bdc-par-1", beneficiaryTypeId: "bt-parent",  docName: "Relationship Proof / Affidavit", isMandatory: true },
    { id: "bdc-par-2", beneficiaryTypeId: "bt-parent",  docName: "Government ID Proof",        isMandatory: true  },
  ];

  for (const bdc of beneDocConfigs) {
    await prisma.beneficiaryDocConfig.upsert({
      where: { id: bdc.id },
      update: {},
      create: {
        ...bdc,
        effectiveFrom: new Date("2024-01-01"),
        isActive:     true,
        changeReason: "Initial beneficiary doc requirement",
        createdBy:    "system",
      },
    });
  }
  console.log(`✓ BeneficiaryTypeMaster (${beneficiaryTypes.length}) + BeneficiaryDocConfig (${beneDocConfigs.length})`);

  // ────────────────────────────────────────────────────────────────
  // 24. SYSTEM ADMIN USER
  // ────────────────────────────────────────────────────────────────
  const adminPasswordHash = await bcrypt.hash("Admin@123456", 12);

  await prisma.user.upsert({
    where: { email: "admin@hrms.local" },
    update: {},
    create: {
      id:           "user-system-admin",
      email:        "admin@hrms.local",
      passwordHash: adminPasswordHash,
      role:         "SYSTEM_ADMIN",
      isActive:     true,
    },
  });
  console.log("✓ System Admin user  →  admin@hrms.local / Admin@123456");

  // ────────────────────────────────────────────────────────────────
  // 25. POC DEMO EMPLOYEES
  // ────────────────────────────────────────────────────────────────
  console.log("\n🎬 Seeding POC demo employees…");

  const demoPassword = await bcrypt.hash("Demo@123456", 12);

  const demoEmployees = [
    {
      emp: {
        id: "emp-arjun",   employeeCode: "EMP001", fullName: "Arjun Mehta",
        email: "arjun.mehta@hrms.local", phone: "+91 98001 11001",
        dateOfBirth: new Date("1988-04-15"), dateOfJoining: new Date("2019-06-01"),
        departmentId: "dept-tech", designationId: "desig-arch", status: "ACTIVE" as const,
      },
      qual: { qualificationTypeId: "qual-pg",  institution: "IIT Bombay",      yearOfCompletion: 2011, grade: "Distinction" },
      exps: [
        { organizationName: "Infosys Ltd", organizationTypeId: "orgtype-mnc", designationHeld: "Senior Developer", startDate: new Date("2011-07-01"), endDate: new Date("2016-05-31"), isCurrent: false, experienceTypes: ["exptype-tech"] },
        { organizationName: "Wipro Technologies", organizationTypeId: "orgtype-mnc", designationHeld: "Tech Lead", startDate: new Date("2016-06-01"), endDate: new Date("2019-05-31"), isCurrent: false, experienceTypes: ["exptype-tech", "exptype-mgmt"] },
      ],
      skills: [
        { skillId: "sk-ts",    proficiencyLevelId: "prof-4", yearsOfExperience: 6 },
        { skillId: "sk-node",  proficiencyLevelId: "prof-4", yearsOfExperience: 7 },
        { skillId: "sk-aws",   proficiencyLevelId: "prof-3", yearsOfExperience: 4 },
        { skillId: "sk-pg",    proficiencyLevelId: "prof-4", yearsOfExperience: 8 },
        { skillId: "sk-lead",  proficiencyLevelId: "prof-3", yearsOfExperience: 5 },
      ],
      certs: [
        { certificationId: "cert-awssa", issueDate: new Date("2022-03-10"), expiryDate: new Date("2025-03-10") },
        { certificationId: "cert-scrum", issueDate: new Date("2021-08-15"), expiryDate: new Date("2024-08-15") },
      ],
    },
    {
      emp: {
        id: "emp-priya",   employeeCode: "EMP002", fullName: "Priya Nair",
        email: "priya.nair@hrms.local", phone: "+91 98001 11002",
        dateOfBirth: new Date("1992-09-22"), dateOfJoining: new Date("2021-03-15"),
        departmentId: "dept-tech", designationId: "desig-sse", status: "ACTIVE" as const,
      },
      qual: { qualificationTypeId: "qual-ug", institution: "NIT Calicut", yearOfCompletion: 2014, grade: "First Class" },
      exps: [
        { organizationName: "TCS", organizationTypeId: "orgtype-mnc", designationHeld: "Software Engineer", startDate: new Date("2014-08-01"), endDate: new Date("2018-07-31"), isCurrent: false, experienceTypes: ["exptype-tech"] },
        { organizationName: "Zoho Corp", organizationTypeId: "orgtype-mid", designationHeld: "Senior Engineer", startDate: new Date("2018-08-01"), endDate: new Date("2021-02-28"), isCurrent: false, experienceTypes: ["exptype-tech"] },
      ],
      skills: [
        { skillId: "sk-react", proficiencyLevelId: "prof-4", yearsOfExperience: 6 },
        { skillId: "sk-ts",    proficiencyLevelId: "prof-3", yearsOfExperience: 4 },
        { skillId: "sk-next",  proficiencyLevelId: "prof-3", yearsOfExperience: 3 },
        { skillId: "sk-mongo", proficiencyLevelId: "prof-2", yearsOfExperience: 2 },
      ],
      certs: [
        { certificationId: "cert-az900", issueDate: new Date("2023-01-20") },
      ],
    },
    {
      emp: {
        id: "emp-rajan",   employeeCode: "EMP003", fullName: "Rajan Pillai",
        email: "rajan.pillai@hrms.local", phone: "+91 98001 11003",
        dateOfBirth: new Date("1985-12-03"), dateOfJoining: new Date("2018-01-10"),
        departmentId: "dept-mgmt", designationId: "desig-dir", status: "ACTIVE" as const,
      },
      qual: { qualificationTypeId: "qual-mba", institution: "IIM Ahmedabad", yearOfCompletion: 2010, grade: "Distinction" },
      exps: [
        { organizationName: "Deloitte", organizationTypeId: "orgtype-mnc", designationHeld: "Manager", startDate: new Date("2010-06-01"), endDate: new Date("2015-05-31"), isCurrent: false, experienceTypes: ["exptype-mgmt", "exptype-cons"] },
        { organizationName: "McKinsey & Company", organizationTypeId: "orgtype-mnc", designationHeld: "Senior Manager", startDate: new Date("2015-06-01"), endDate: new Date("2018-01-01"), isCurrent: false, experienceTypes: ["exptype-mgmt", "exptype-cons"] },
      ],
      skills: [
        { skillId: "sk-lead",  proficiencyLevelId: "prof-4", yearsOfExperience: 12 },
        { skillId: "sk-pm",    proficiencyLevelId: "prof-4", yearsOfExperience: 10 },
        { skillId: "sk-agile", proficiencyLevelId: "prof-3", yearsOfExperience: 8 },
        { skillId: "sk-comm",  proficiencyLevelId: "prof-4", yearsOfExperience: 13 },
      ],
      certs: [
        { certificationId: "cert-pmp", issueDate: new Date("2016-07-01"), expiryDate: new Date("2025-07-01") },
        { certificationId: "cert-scrum", issueDate: new Date("2020-02-10"), expiryDate: new Date("2024-02-10") },
      ],
    },
    {
      emp: {
        id: "emp-kavya",   employeeCode: "EMP004", fullName: "Kavya Sharma",
        email: "kavya.sharma@hrms.local", phone: "+91 98001 11004",
        dateOfBirth: new Date("1994-07-18"), dateOfJoining: new Date("2022-08-01"),
        departmentId: "dept-tech", designationId: "desig-se", status: "ACTIVE" as const,
      },
      qual: { qualificationTypeId: "qual-ug", institution: "VIT Vellore", yearOfCompletion: 2016, grade: "First Class" },
      exps: [
        { organizationName: "Freshworks", organizationTypeId: "orgtype-mid", designationHeld: "Software Engineer", startDate: new Date("2016-07-01"), endDate: new Date("2022-07-31"), isCurrent: false, experienceTypes: ["exptype-tech"] },
      ],
      skills: [
        { skillId: "sk-py",    proficiencyLevelId: "prof-3", yearsOfExperience: 5 },
        { skillId: "sk-pg",    proficiencyLevelId: "prof-2", yearsOfExperience: 3 },
        { skillId: "sk-aws",   proficiencyLevelId: "prof-2", yearsOfExperience: 2 },
        { skillId: "sk-docker",proficiencyLevelId: "prof-2", yearsOfExperience: 2 },
      ],
      certs: [],
    },
    {
      emp: {
        id: "emp-senthil", employeeCode: "EMP005", fullName: "Senthil Kumar",
        email: "senthil.kumar@hrms.local", phone: "+91 98001 11005",
        dateOfBirth: new Date("1990-02-28"), dateOfJoining: new Date("2020-04-01"),
        departmentId: "dept-fin", designationId: "desig-fm", status: "ACTIVE" as const,
      },
      qual: { qualificationTypeId: "qual-prof", institution: "ICAI", yearOfCompletion: 2013, grade: "Pass" },
      exps: [
        { organizationName: "KPMG India", organizationTypeId: "orgtype-mnc", designationHeld: "Finance Analyst", startDate: new Date("2013-09-01"), endDate: new Date("2017-08-31"), isCurrent: false, experienceTypes: ["exptype-dom"] },
        { organizationName: "HDFC Bank", organizationTypeId: "orgtype-mnc", designationHeld: "Senior Finance Analyst", startDate: new Date("2017-09-01"), endDate: new Date("2020-03-31"), isCurrent: false, experienceTypes: ["exptype-dom", "exptype-mgmt"] },
      ],
      skills: [
        { skillId: "sk-sql",  proficiencyLevelId: "prof-4", yearsOfExperience: 8 },
        { skillId: "sk-bi",   proficiencyLevelId: "prof-3", yearsOfExperience: 6 },
        { skillId: "sk-comm", proficiencyLevelId: "prof-3", yearsOfExperience: 10 },
        { skillId: "sk-prob", proficiencyLevelId: "prof-3", yearsOfExperience: 9 },
      ],
      certs: [
        { certificationId: "cert-ca", issueDate: new Date("2013-09-15") },
        { certificationId: "cert-cfa", issueDate: new Date("2019-04-01") },
      ],
    },
    {
      emp: {
        id: "emp-ananya",  employeeCode: "EMP006", fullName: "Ananya Krishnan",
        email: "ananya.krishnan@hrms.local", phone: "+91 98001 11006",
        dateOfBirth: new Date("1993-11-05"), dateOfJoining: new Date("2021-09-01"),
        departmentId: "dept-hr", designationId: "desig-hrm", status: "ACTIVE" as const,
      },
      qual: { qualificationTypeId: "qual-pg", institution: "XLRI Jamshedpur", yearOfCompletion: 2016, grade: "First Class" },
      exps: [
        { organizationName: "HCL Technologies", organizationTypeId: "orgtype-mnc", designationHeld: "HR Executive", startDate: new Date("2016-06-01"), endDate: new Date("2019-05-31"), isCurrent: false, experienceTypes: ["exptype-dom"] },
        { organizationName: "Swiggy", organizationTypeId: "orgtype-start", designationHeld: "HR Manager", startDate: new Date("2019-06-01"), endDate: new Date("2021-08-31"), isCurrent: false, experienceTypes: ["exptype-dom", "exptype-mgmt"] },
      ],
      skills: [
        { skillId: "sk-comm", proficiencyLevelId: "prof-4", yearsOfExperience: 8 },
        { skillId: "sk-lead", proficiencyLevelId: "prof-3", yearsOfExperience: 5 },
        { skillId: "sk-prob", proficiencyLevelId: "prof-3", yearsOfExperience: 7 },
        { skillId: "sk-pm",   proficiencyLevelId: "prof-2", yearsOfExperience: 3 },
      ],
      certs: [
        { certificationId: "cert-scrum", issueDate: new Date("2022-05-10"), expiryDate: new Date("2025-05-10") },
      ],
    },
    {
      emp: {
        id: "emp-vikram",  employeeCode: "EMP007", fullName: "Vikram Singh",
        email: "vikram.singh@hrms.local", phone: "+91 98001 11007",
        dateOfBirth: new Date("1987-06-14"), dateOfJoining: new Date("2020-11-01"),
        departmentId: "dept-tech", designationId: "desig-tl", status: "ACTIVE" as const,
      },
      qual: { qualificationTypeId: "qual-pg", institution: "BITS Pilani", yearOfCompletion: 2010, grade: "First Class" },
      exps: [
        { organizationName: "Accenture", organizationTypeId: "orgtype-mnc", designationHeld: "Developer", startDate: new Date("2010-08-01"), endDate: new Date("2014-07-31"), isCurrent: false, experienceTypes: ["exptype-tech"] },
        { organizationName: "Ola Cabs", organizationTypeId: "orgtype-start", designationHeld: "Senior Engineer", startDate: new Date("2014-08-01"), endDate: new Date("2018-06-30"), isCurrent: false, experienceTypes: ["exptype-tech"] },
        { organizationName: "Razorpay", organizationTypeId: "orgtype-start", designationHeld: "Tech Lead", startDate: new Date("2018-07-01"), endDate: new Date("2020-10-31"), isCurrent: false, experienceTypes: ["exptype-tech", "exptype-mgmt"] },
      ],
      skills: [
        { skillId: "sk-py",    proficiencyLevelId: "prof-4", yearsOfExperience: 9 },
        { skillId: "sk-k8s",   proficiencyLevelId: "prof-4", yearsOfExperience: 5 },
        { skillId: "sk-docker",proficiencyLevelId: "prof-4", yearsOfExperience: 6 },
        { skillId: "sk-aws",   proficiencyLevelId: "prof-4", yearsOfExperience: 7 },
        { skillId: "sk-redis", proficiencyLevelId: "prof-3", yearsOfExperience: 4 },
      ],
      certs: [
        { certificationId: "cert-awssa", issueDate: new Date("2021-05-20"), expiryDate: new Date("2024-05-20") },
        { certificationId: "cert-cka",   issueDate: new Date("2022-09-01"), expiryDate: new Date("2025-09-01") },
      ],
    },
    {
      emp: {
        id: "emp-meena",   employeeCode: "EMP008", fullName: "Meena Rajendran",
        email: "meena.rajendran@hrms.local", phone: "+91 98001 11008",
        dateOfBirth: new Date("1995-03-30"), dateOfJoining: new Date("2023-02-01"),
        departmentId: "dept-tech", designationId: "desig-se", status: "ACTIVE" as const,
      },
      qual: { qualificationTypeId: "qual-ug", institution: "PSG College of Technology", yearOfCompletion: 2017, grade: "First Class" },
      exps: [
        { organizationName: "Cognizant", organizationTypeId: "orgtype-mnc", designationHeld: "Programmer Analyst", startDate: new Date("2017-09-01"), endDate: new Date("2021-08-31"), isCurrent: false, experienceTypes: ["exptype-tech"] },
        { organizationName: "CRED", organizationTypeId: "orgtype-start", designationHeld: "Software Engineer", startDate: new Date("2021-09-01"), endDate: new Date("2023-01-31"), isCurrent: false, experienceTypes: ["exptype-tech"] },
      ],
      skills: [
        { skillId: "sk-java",  proficiencyLevelId: "prof-3", yearsOfExperience: 5 },
        { skillId: "sk-mongo", proficiencyLevelId: "prof-3", yearsOfExperience: 4 },
        { skillId: "sk-react", proficiencyLevelId: "prof-2", yearsOfExperience: 2 },
        { skillId: "sk-sql",   proficiencyLevelId: "prof-3", yearsOfExperience: 5 },
      ],
      certs: [],
    },
    {
      emp: {
        id: "emp-thomas",  employeeCode: "EMP009", fullName: "Thomas Varghese",
        email: "thomas.varghese@hrms.local", phone: "+91 98001 11009",
        dateOfBirth: new Date("1991-08-19"), dateOfJoining: new Date("2019-10-01"),
        departmentId: "dept-ops", designationId: "desig-ops", status: "ACTIVE" as const,
      },
      qual: { qualificationTypeId: "qual-ug", institution: "Mahatma Gandhi University", yearOfCompletion: 2013, grade: "Second Class" },
      exps: [
        { organizationName: "DHL Supply Chain", organizationTypeId: "orgtype-mnc", designationHeld: "Operations Coordinator", startDate: new Date("2013-07-01"), endDate: new Date("2017-06-30"), isCurrent: false, experienceTypes: ["exptype-dom"] },
        { organizationName: "Flipkart Logistics", organizationTypeId: "orgtype-start", designationHeld: "Senior Operations Executive", startDate: new Date("2017-07-01"), endDate: new Date("2019-09-30"), isCurrent: false, experienceTypes: ["exptype-dom", "exptype-mgmt"] },
      ],
      skills: [
        { skillId: "sk-prob", proficiencyLevelId: "prof-3", yearsOfExperience: 8 },
        { skillId: "sk-comm", proficiencyLevelId: "prof-3", yearsOfExperience: 10 },
        { skillId: "sk-sql",  proficiencyLevelId: "prof-2", yearsOfExperience: 3 },
        { skillId: "sk-bi",   proficiencyLevelId: "prof-2", yearsOfExperience: 2 },
      ],
      certs: [
        { certificationId: "cert-iso", issueDate: new Date("2023-03-01"), expiryDate: new Date("2026-03-01") },
      ],
    },
    {
      emp: {
        id: "emp-lakshmi", employeeCode: "EMP010", fullName: "Lakshmi Patel",
        email: "lakshmi.patel@hrms.local", phone: "+91 98001 11010",
        dateOfBirth: new Date("1996-01-12"), dateOfJoining: new Date("2022-05-16"),
        departmentId: "dept-fin", designationId: "desig-fa", status: "ACTIVE" as const,
      },
      qual: { qualificationTypeId: "qual-mba", institution: "SP Jain School of Management", yearOfCompletion: 2019, grade: "Distinction" },
      exps: [
        { organizationName: "Ernst & Young (EY)", organizationTypeId: "orgtype-mnc", designationHeld: "Finance Analyst", startDate: new Date("2019-07-01"), endDate: new Date("2022-04-30"), isCurrent: false, experienceTypes: ["exptype-dom"] },
      ],
      skills: [
        { skillId: "sk-sql",  proficiencyLevelId: "prof-3", yearsOfExperience: 4 },
        { skillId: "sk-bi",   proficiencyLevelId: "prof-4", yearsOfExperience: 5 },
        { skillId: "sk-comm", proficiencyLevelId: "prof-3", yearsOfExperience: 5 },
        { skillId: "sk-prob", proficiencyLevelId: "prof-3", yearsOfExperience: 4 },
      ],
      certs: [
        { certificationId: "cert-cfa", issueDate: new Date("2023-06-01") },
      ],
    },
    {
      emp: {
        id: "emp-deepak",  employeeCode: "EMP011", fullName: "Deepak Nambiar",
        email: "deepak.nambiar@hrms.local", phone: "+91 98001 11011",
        dateOfBirth: new Date("1989-05-25"), dateOfJoining: new Date("2018-08-01"),
        departmentId: "dept-sales", designationId: "desig-pm", status: "ACTIVE" as const,
      },
      qual: { qualificationTypeId: "qual-pg", institution: "NMIMS Mumbai", yearOfCompletion: 2012, grade: "First Class" },
      exps: [
        { organizationName: "SAP India", organizationTypeId: "orgtype-mnc", designationHeld: "Business Analyst", startDate: new Date("2012-06-01"), endDate: new Date("2016-05-31"), isCurrent: false, experienceTypes: ["exptype-dom", "exptype-cons"] },
        { organizationName: "Salesforce", organizationTypeId: "orgtype-mnc", designationHeld: "Project Manager", startDate: new Date("2016-06-01"), endDate: new Date("2018-07-31"), isCurrent: false, experienceTypes: ["exptype-mgmt", "exptype-cons"] },
      ],
      skills: [
        { skillId: "sk-pm",    proficiencyLevelId: "prof-4", yearsOfExperience: 8 },
        { skillId: "sk-agile", proficiencyLevelId: "prof-4", yearsOfExperience: 7 },
        { skillId: "sk-comm",  proficiencyLevelId: "prof-4", yearsOfExperience: 12 },
        { skillId: "sk-lead",  proficiencyLevelId: "prof-3", yearsOfExperience: 6 },
      ],
      certs: [
        { certificationId: "cert-pmp",   issueDate: new Date("2017-03-15"), expiryDate: new Date("2026-03-15") },
        { certificationId: "cert-scrum", issueDate: new Date("2020-11-01"), expiryDate: new Date("2024-11-01") },
      ],
    },
    {
      emp: {
        id: "emp-ritu",    employeeCode: "EMP012", fullName: "Ritu Agarwal",
        email: "ritu.agarwal@hrms.local", phone: "+91 98001 11012",
        dateOfBirth: new Date("1998-09-07"), dateOfJoining: new Date("2024-01-15"),
        departmentId: "dept-tech", designationId: "desig-se", status: "ACTIVE" as const,
      },
      qual: { qualificationTypeId: "qual-ug", institution: "DTU Delhi", yearOfCompletion: 2020, grade: "First Class" },
      exps: [
        { organizationName: "Byju's", organizationTypeId: "orgtype-start", designationHeld: "Junior Developer", startDate: new Date("2020-08-01"), endDate: new Date("2023-12-31"), isCurrent: false, experienceTypes: ["exptype-tech"] },
      ],
      skills: [
        { skillId: "sk-react", proficiencyLevelId: "prof-2", yearsOfExperience: 3 },
        { skillId: "sk-ts",    proficiencyLevelId: "prof-2", yearsOfExperience: 3 },
        { skillId: "sk-node",  proficiencyLevelId: "prof-2", yearsOfExperience: 2 },
        { skillId: "sk-pg",    proficiencyLevelId: "prof-1", yearsOfExperience: 1 },
      ],
      certs: [],
    },
  ];

  // Set manager for senior employees
  const managerMap: Record<string, string> = {
    "emp-arjun":  "emp-rajan",
    "emp-priya":  "emp-arjun",
    "emp-kavya":  "emp-arjun",
    "emp-vikram": "emp-arjun",
    "emp-meena":  "emp-arjun",
    "emp-ritu":   "emp-priya",
    "emp-senthil":"emp-rajan",
    "emp-lakshmi":"emp-senthil",
    "emp-ananya": "emp-rajan",
    "emp-deepak": "emp-rajan",
    "emp-thomas": "emp-rajan",
  };

  const calcYears = (start: Date, end: Date | null) => {
    const e = end ?? new Date();
    return Math.max(0, (e.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
  };

  for (const demo of demoEmployees) {
    const { emp, qual, exps, skills, certs } = demo;

    // Upsert employee
    await prisma.employee.upsert({
      where: { email: emp.email },
      update: { fullName: emp.fullName, status: emp.status },
      create: {
        ...emp,
        managerId: managerMap[emp.id],
      },
    });

    // Upsert user account
    await prisma.user.upsert({
      where: { email: emp.email },
      update: {},
      create: {
        email:        emp.email,
        passwordHash: demoPassword,
        role:         "EMPLOYEE",
        isActive:     true,
        employeeId:   emp.id,
      },
    });

    // Qualification (one per employee for demo)
    const existingQual = await prisma.employeeQualification.findFirst({ where: { employeeId: emp.id } });
    if (!existingQual) {
      await prisma.employeeQualification.create({
        data: { employeeId: emp.id, ...qual, verificationStatus: "VERIFIED" },
      });
    }

    // Experiences
    const existingExpCount = await prisma.employeeExperience.count({ where: { employeeId: emp.id } });
    if (existingExpCount === 0) {
      for (const ex of exps) {
        const { experienceTypes, ...rest } = ex;
        await prisma.employeeExperience.create({
          data: {
            ...rest,
            employeeId: emp.id,
            yearsCalculated: calcYears(ex.startDate, ex.endDate ?? null),
            experienceTypes: {
              create: experienceTypes.map((tid) => ({ experienceTypeId: tid })),
            },
          },
        });
      }
    }

    // Skills
    for (const sk of skills) {
      await prisma.employeeSkill.upsert({
        where: { employeeId_skillId: { employeeId: emp.id, skillId: sk.skillId } },
        update: { proficiencyLevelId: sk.proficiencyLevelId, yearsOfExperience: sk.yearsOfExperience },
        create: { employeeId: emp.id, ...sk },
      });
    }

    // Certifications
    for (const cert of certs) {
      const exists = await prisma.employeeCertification.findFirst({
        where: { employeeId: emp.id, certificationId: cert.certificationId },
      });
      if (!exists) {
        await prisma.employeeCertification.create({
          data: {
            employeeId: emp.id,
            ...cert,
            isExpired: cert.expiryDate ? cert.expiryDate < new Date() : false,
          },
        });
      }
    }
  }

  console.log(`✓ Demo employees (${demoEmployees.length}) with qualifications, experience, skills, certifications`);

  // Calculate BPV for all demo employees
  console.log("⚙️  Calculating BPV scores…");
  const { calculateBpv } = await import("../src/modules/employee/bpv.service");
  for (const demo of demoEmployees) {
    try {
      await calculateBpv(demo.emp.id, "user-system-admin", "INITIAL_SEED");
    } catch (e) {
      console.warn(`  ⚠ BPV skipped for ${demo.emp.fullName}: ${(e as Error).message}`);
    }
  }
  console.log("✓ BPV scores calculated for all demo employees");

  // ────────────────────────────────────────────────────────────────
  console.log("\n✅ Seed completed successfully.");
  console.log("─────────────────────────────────────────────────────");
  console.log("  Admin login:  admin@hrms.local");
  console.log("  Password:     Admin@123456");
  console.log("─────────────────────────────────────────────────────\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
