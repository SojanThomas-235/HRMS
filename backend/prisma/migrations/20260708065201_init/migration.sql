-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('EMPLOYEE', 'MANAGER', 'HR_ADMIN', 'FINANCE_ADMIN', 'SYSTEM_ADMIN');

-- CreateEnum
CREATE TYPE "EmployeeStatus" AS ENUM ('ACTIVE', 'ON_NOTICE', 'EXITED');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('ASSIGNED', 'IN_PROGRESS', 'SUBMITTED', 'PENDING_REVIEW', 'ACCEPTED', 'RETURNED', 'OVERDUE');

-- CreateEnum
CREATE TYPE "TaskCompletionStatus" AS ENUM ('FULLY_COMPLETED', 'PARTIALLY_COMPLETED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "TimeEntryStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AssetStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'ARCHIVED', 'DEPRECATED');

-- CreateEnum
CREATE TYPE "QualVerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'FLAGGED');

-- CreateEnum
CREATE TYPE "BeneficiaryStatus" AS ENUM ('PENDING', 'ACTIVE', 'REJECTED', 'REMOVED');

-- CreateEnum
CREATE TYPE "RewardNominationStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "RewardPaymentStatus" AS ENUM ('PENDING', 'SCHEDULED', 'PAID');

-- CreateEnum
CREATE TYPE "VersionType" AS ENUM ('MAJOR', 'MINOR');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'EMPLOYEE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "employeeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DepartmentMaster" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DepartmentMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DesignationMaster" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "grade" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DesignationMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionConfig" (
    "id" TEXT NOT NULL,
    "accessTokenTtlMinutes" INTEGER NOT NULL DEFAULT 15,
    "refreshTokenTtlDays" INTEGER NOT NULL DEFAULT 7,
    "maxLoginAttempts" INTEGER NOT NULL DEFAULT 5,
    "lockoutDurationMinutes" INTEGER NOT NULL DEFAULT 30,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "changeReason" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SessionConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BpvWeightConfig" (
    "id" TEXT NOT NULL,
    "educationPct" DOUBLE PRECISION NOT NULL,
    "experiencePct" DOUBLE PRECISION NOT NULL,
    "orgProfilePct" DOUBLE PRECISION NOT NULL,
    "skillsPct" DOUBLE PRECISION NOT NULL,
    "certsPct" DOUBLE PRECISION NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "changeReason" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BpvWeightConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QualificationMaster" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "scoreContribution" DOUBLE PRECISION NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QualificationMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExperienceBandMaster" (
    "id" TEXT NOT NULL,
    "yearsFrom" DOUBLE PRECISION NOT NULL,
    "yearsTo" DOUBLE PRECISION NOT NULL,
    "scorePoints" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExperienceBandMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExperienceTypeMaster" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "weightContribution" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExperienceTypeMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationTypeMaster" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "scoreContribution" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationTypeMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillCategoryMaster" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SkillCategoryMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillMaster" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SkillMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillProficiencyMaster" (
    "id" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "scoreMultiplier" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SkillProficiencyMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CertificationMaster" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "issuingBody" TEXT NOT NULL,
    "scoreContribution" DOUBLE PRECISION NOT NULL,
    "hasExpiry" BOOLEAN NOT NULL DEFAULT true,
    "expiryAlertDays" INTEGER NOT NULL DEFAULT 60,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CertificationMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BpvScoreCapConfig" (
    "id" TEXT NOT NULL,
    "grade" TEXT,
    "designationId" TEXT,
    "maxScore" DOUBLE PRECISION NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "changeReason" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BpvScoreCapConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeBlockMaster" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "hours" DOUBLE PRECISION NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimeBlockMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskCategoryMaster" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "benchmarkHours" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaskCategoryMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QualityRatingMaster" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "numericValue" DOUBLE PRECISION NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QualityRatingMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QualityCriteriaMaster" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "criteriaText" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QualityCriteriaMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalaryGradeMaster" (
    "id" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "component1Pct" DOUBLE PRECISION NOT NULL,
    "component2Pct" DOUBLE PRECISION NOT NULL,
    "component2Rate" DOUBLE PRECISION NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "changeReason" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SalaryGradeMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalaryBandMaster" (
    "id" TEXT NOT NULL,
    "gradeId" TEXT NOT NULL,
    "bpvScoreFrom" DOUBLE PRECISION NOT NULL,
    "bpvScoreTo" DOUBLE PRECISION NOT NULL,
    "salaryFrom" DOUBLE PRECISION NOT NULL,
    "salaryTo" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "changeReason" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SalaryBandMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewCycleConfig" (
    "id" TEXT NOT NULL,
    "cycleType" TEXT NOT NULL,
    "departmentId" TEXT,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "changeReason" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewCycleConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EfficiencyWeightConfig" (
    "id" TEXT NOT NULL,
    "completionRatePct" DOUBLE PRECISION NOT NULL,
    "qualityScorePct" DOUBLE PRECISION NOT NULL,
    "timeEfficiencyPct" DOUBLE PRECISION NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "changeReason" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EfficiencyWeightConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EfficiencyTierMaster" (
    "id" TEXT NOT NULL,
    "tierName" TEXT NOT NULL,
    "scoreFrom" DOUBLE PRECISION NOT NULL,
    "scoreTo" DOUBLE PRECISION NOT NULL,
    "incentivePct" DOUBLE PRECISION NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EfficiencyTierMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetTypeMaster" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssetTypeMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentationTypeMaster" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentationTypeMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocRequirementConfig" (
    "id" TEXT NOT NULL,
    "assetTypeId" TEXT NOT NULL,
    "docTypeId" TEXT NOT NULL,
    "isMandatory" BOOLEAN NOT NULL DEFAULT true,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "changeReason" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocRequirementConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplianceThresholdConfig" (
    "id" TEXT NOT NULL,
    "assetTypeId" TEXT,
    "thresholdPct" DOUBLE PRECISION NOT NULL DEFAULT 80,
    "action" TEXT NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "changeReason" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComplianceThresholdConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RewardTypeMaster" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RewardTypeMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RewardBasisMaster" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RewardBasisMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RewardFormulaConfig" (
    "id" TEXT NOT NULL,
    "rewardTypeId" TEXT NOT NULL,
    "formulaDescription" TEXT NOT NULL,
    "parameters" JSONB NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "changeReason" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RewardFormulaConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RewardContributionConfig" (
    "id" TEXT NOT NULL,
    "splitMethod" TEXT NOT NULL,
    "creatorPct" DOUBLE PRECISION,
    "contributorPct" DOUBLE PRECISION,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "changeReason" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RewardContributionConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RewardCapConfig" (
    "id" TEXT NOT NULL,
    "grade" TEXT,
    "rewardTypeCode" TEXT,
    "maxAmountPerYear" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "changeReason" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RewardCapConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BeneficiaryTypeMaster" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BeneficiaryTypeMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BeneficiaryDocConfig" (
    "id" TEXT NOT NULL,
    "beneficiaryTypeId" TEXT NOT NULL,
    "docName" TEXT NOT NULL,
    "isMandatory" BOOLEAN NOT NULL DEFAULT true,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "changeReason" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BeneficiaryDocConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "employeeCode" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "dateOfJoining" TIMESTAMP(3) NOT NULL,
    "status" "EmployeeStatus" NOT NULL DEFAULT 'ACTIVE',
    "departmentId" TEXT NOT NULL,
    "designationId" TEXT NOT NULL,
    "managerId" TEXT,
    "exitDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeQualification" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "qualificationTypeId" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "yearOfCompletion" INTEGER NOT NULL,
    "grade" TEXT,
    "certificateFileRef" TEXT,
    "verificationStatus" "QualVerificationStatus" NOT NULL DEFAULT 'PENDING',
    "verificationNote" TEXT,
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeQualification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeExperience" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "organizationName" TEXT NOT NULL,
    "organizationTypeId" TEXT NOT NULL,
    "designationHeld" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "yearsCalculated" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeExperience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeExperienceType" (
    "id" TEXT NOT NULL,
    "experienceId" TEXT NOT NULL,
    "experienceTypeId" TEXT NOT NULL,

    CONSTRAINT "EmployeeExperienceType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeSkill" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "proficiencyLevelId" TEXT NOT NULL,
    "yearsOfExperience" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeCertification" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "certificationId" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "isExpired" BOOLEAN NOT NULL DEFAULT false,
    "certificateFileRef" TEXT,
    "renewedFromId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeCertification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BpvScore" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "educationScore" DOUBLE PRECISION NOT NULL,
    "experienceScore" DOUBLE PRECISION NOT NULL,
    "orgScore" DOUBLE PRECISION NOT NULL,
    "skillScore" DOUBLE PRECISION NOT NULL,
    "certScore" DOUBLE PRECISION NOT NULL,
    "configVersionId" TEXT NOT NULL,
    "triggerReason" TEXT NOT NULL,
    "triggeredBy" TEXT NOT NULL,
    "inputSnapshot" JSONB NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BpvScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalaryRecord" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "component1Amount" DOUBLE PRECISION NOT NULL,
    "component2Amount" DOUBLE PRECISION NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "bpvScoreUsed" DOUBLE PRECISION NOT NULL,
    "gradeId" TEXT NOT NULL,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalaryRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "deliverables" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "assigneeId" TEXT NOT NULL,
    "assignedById" TEXT NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'ASSIGNED',
    "expectedCompletionDate" TIMESTAMP(3) NOT NULL,
    "completionStatus" "TaskCompletionStatus",
    "blockerNotes" TEXT,
    "qualityRatingId" TEXT,
    "revisionCount" INTEGER NOT NULL DEFAULT 0,
    "acceptedAt" TIMESTAMP(3),
    "acceptedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskQualityCriteria" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "criteriaId" TEXT NOT NULL,
    "employeeResponse" TEXT,
    "managerResponse" TEXT,

    CONSTRAINT "TaskQualityCriteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeEntry" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "timeBlockId" TEXT NOT NULL,
    "entryDate" DATE NOT NULL,
    "notes" TEXT,
    "status" "TimeEntryStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimeEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EfficiencyScore" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "completionRate" DOUBLE PRECISION NOT NULL,
    "qualityScore" DOUBLE PRECISION NOT NULL,
    "timeEfficiency" DOUBLE PRECISION NOT NULL,
    "finalScore" DOUBLE PRECISION NOT NULL,
    "configVersionId" TEXT NOT NULL,
    "tierId" TEXT,
    "incentivePct" DOUBLE PRECISION,
    "tasksEvaluated" INTEGER NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EfficiencyScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "assetTypeId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "currentOwnerId" TEXT NOT NULL,
    "status" "AssetStatus" NOT NULL DEFAULT 'DRAFT',
    "currentVersion" TEXT NOT NULL DEFAULT '1.0',
    "complianceScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tags" TEXT[],
    "projectOrDept" TEXT,
    "reviewerId" TEXT,
    "approverId" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetOwnership" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "removedAt" TIMESTAMP(3),

    CONSTRAINT "AssetOwnership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetVersion" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "versionType" "VersionType" NOT NULL,
    "changeSummary" TEXT NOT NULL,
    "changedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssetVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetDocumentation" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "docTypeId" TEXT NOT NULL,
    "fileRef" TEXT,
    "content" TEXT,
    "isNotApplicable" BOOLEAN NOT NULL DEFAULT false,
    "naApprovedBy" TEXT,
    "naApprovedAt" TIMESTAMP(3),
    "naReason" TEXT,
    "uploadedById" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssetDocumentation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContributionRecord" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "taskId" TEXT,
    "assetId" TEXT,
    "contributionType" TEXT NOT NULL,
    "qualityRating" DOUBLE PRECISION,
    "notes" TEXT,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContributionRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RewardNomination" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "rewardTypeId" TEXT NOT NULL,
    "rewardBasisId" TEXT NOT NULL,
    "measuredValue" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" "RewardNominationStatus" NOT NULL DEFAULT 'DRAFT',
    "nominatedById" TEXT NOT NULL,
    "notes" TEXT,
    "rejectionReason" TEXT,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RewardNomination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RewardRecord" (
    "id" TEXT NOT NULL,
    "nominationId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "splitPct" DOUBLE PRECISION NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "paymentStatus" "RewardPaymentStatus" NOT NULL DEFAULT 'PENDING',
    "scheduledDate" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RewardRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Beneficiary" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "beneficiaryTypeId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "contactDetails" TEXT,
    "allocationPct" DOUBLE PRECISION NOT NULL,
    "status" "BeneficiaryStatus" NOT NULL DEFAULT 'PENDING',
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Beneficiary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BeneficiaryDocument" (
    "id" TEXT NOT NULL,
    "beneficiaryId" TEXT NOT NULL,
    "docName" TEXT NOT NULL,
    "fileRef" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BeneficiaryDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "module" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "action" TEXT NOT NULL,
    "oldValue" JSONB,
    "newValue" JSONB,
    "changeReason" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_employeeId_key" ON "User"("employeeId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DepartmentMaster_name_key" ON "DepartmentMaster"("name");

-- CreateIndex
CREATE UNIQUE INDEX "DepartmentMaster_code_key" ON "DepartmentMaster"("code");

-- CreateIndex
CREATE UNIQUE INDEX "DesignationMaster_title_key" ON "DesignationMaster"("title");

-- CreateIndex
CREATE UNIQUE INDEX "DesignationMaster_code_key" ON "DesignationMaster"("code");

-- CreateIndex
CREATE INDEX "BpvWeightConfig_isActive_idx" ON "BpvWeightConfig"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "QualificationMaster_name_key" ON "QualificationMaster"("name");

-- CreateIndex
CREATE UNIQUE INDEX "QualificationMaster_code_key" ON "QualificationMaster"("code");

-- CreateIndex
CREATE INDEX "ExperienceBandMaster_yearsFrom_yearsTo_idx" ON "ExperienceBandMaster"("yearsFrom", "yearsTo");

-- CreateIndex
CREATE UNIQUE INDEX "ExperienceTypeMaster_name_key" ON "ExperienceTypeMaster"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ExperienceTypeMaster_code_key" ON "ExperienceTypeMaster"("code");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationTypeMaster_name_key" ON "OrganizationTypeMaster"("name");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationTypeMaster_code_key" ON "OrganizationTypeMaster"("code");

-- CreateIndex
CREATE UNIQUE INDEX "SkillCategoryMaster_name_key" ON "SkillCategoryMaster"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SkillCategoryMaster_code_key" ON "SkillCategoryMaster"("code");

-- CreateIndex
CREATE UNIQUE INDEX "SkillMaster_code_key" ON "SkillMaster"("code");

-- CreateIndex
CREATE INDEX "SkillMaster_categoryId_idx" ON "SkillMaster"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "SkillMaster_name_categoryId_key" ON "SkillMaster"("name", "categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "SkillProficiencyMaster_level_key" ON "SkillProficiencyMaster"("level");

-- CreateIndex
CREATE UNIQUE INDEX "SkillProficiencyMaster_code_key" ON "SkillProficiencyMaster"("code");

-- CreateIndex
CREATE UNIQUE INDEX "CertificationMaster_name_key" ON "CertificationMaster"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CertificationMaster_code_key" ON "CertificationMaster"("code");

-- CreateIndex
CREATE UNIQUE INDEX "TaskCategoryMaster_name_key" ON "TaskCategoryMaster"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TaskCategoryMaster_code_key" ON "TaskCategoryMaster"("code");

-- CreateIndex
CREATE UNIQUE INDEX "QualityRatingMaster_label_key" ON "QualityRatingMaster"("label");

-- CreateIndex
CREATE INDEX "QualityCriteriaMaster_categoryId_idx" ON "QualityCriteriaMaster"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "SalaryGradeMaster_grade_key" ON "SalaryGradeMaster"("grade");

-- CreateIndex
CREATE INDEX "SalaryBandMaster_gradeId_idx" ON "SalaryBandMaster"("gradeId");

-- CreateIndex
CREATE UNIQUE INDEX "AssetTypeMaster_name_key" ON "AssetTypeMaster"("name");

-- CreateIndex
CREATE UNIQUE INDEX "AssetTypeMaster_code_key" ON "AssetTypeMaster"("code");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentationTypeMaster_name_key" ON "DocumentationTypeMaster"("name");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentationTypeMaster_code_key" ON "DocumentationTypeMaster"("code");

-- CreateIndex
CREATE INDEX "DocRequirementConfig_assetTypeId_idx" ON "DocRequirementConfig"("assetTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "DocRequirementConfig_assetTypeId_docTypeId_key" ON "DocRequirementConfig"("assetTypeId", "docTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "RewardTypeMaster_name_key" ON "RewardTypeMaster"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RewardTypeMaster_code_key" ON "RewardTypeMaster"("code");

-- CreateIndex
CREATE UNIQUE INDEX "RewardBasisMaster_name_key" ON "RewardBasisMaster"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RewardBasisMaster_code_key" ON "RewardBasisMaster"("code");

-- CreateIndex
CREATE INDEX "RewardFormulaConfig_rewardTypeId_idx" ON "RewardFormulaConfig"("rewardTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "BeneficiaryTypeMaster_name_key" ON "BeneficiaryTypeMaster"("name");

-- CreateIndex
CREATE UNIQUE INDEX "BeneficiaryTypeMaster_code_key" ON "BeneficiaryTypeMaster"("code");

-- CreateIndex
CREATE INDEX "BeneficiaryDocConfig_beneficiaryTypeId_idx" ON "BeneficiaryDocConfig"("beneficiaryTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_employeeCode_key" ON "Employee"("employeeCode");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");

-- CreateIndex
CREATE INDEX "Employee_departmentId_idx" ON "Employee"("departmentId");

-- CreateIndex
CREATE INDEX "Employee_designationId_idx" ON "Employee"("designationId");

-- CreateIndex
CREATE INDEX "Employee_managerId_idx" ON "Employee"("managerId");

-- CreateIndex
CREATE INDEX "Employee_status_idx" ON "Employee"("status");

-- CreateIndex
CREATE INDEX "EmployeeQualification_employeeId_idx" ON "EmployeeQualification"("employeeId");

-- CreateIndex
CREATE INDEX "EmployeeExperience_employeeId_idx" ON "EmployeeExperience"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeExperienceType_experienceId_experienceTypeId_key" ON "EmployeeExperienceType"("experienceId", "experienceTypeId");

-- CreateIndex
CREATE INDEX "EmployeeSkill_employeeId_idx" ON "EmployeeSkill"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeSkill_employeeId_skillId_key" ON "EmployeeSkill"("employeeId", "skillId");

-- CreateIndex
CREATE INDEX "EmployeeCertification_employeeId_idx" ON "EmployeeCertification"("employeeId");

-- CreateIndex
CREATE INDEX "EmployeeCertification_expiryDate_idx" ON "EmployeeCertification"("expiryDate");

-- CreateIndex
CREATE INDEX "BpvScore_employeeId_idx" ON "BpvScore"("employeeId");

-- CreateIndex
CREATE INDEX "BpvScore_calculatedAt_idx" ON "BpvScore"("calculatedAt");

-- CreateIndex
CREATE INDEX "SalaryRecord_employeeId_idx" ON "SalaryRecord"("employeeId");

-- CreateIndex
CREATE INDEX "SalaryRecord_period_idx" ON "SalaryRecord"("period");

-- CreateIndex
CREATE UNIQUE INDEX "SalaryRecord_employeeId_period_key" ON "SalaryRecord"("employeeId", "period");

-- CreateIndex
CREATE INDEX "Task_assigneeId_idx" ON "Task"("assigneeId");

-- CreateIndex
CREATE INDEX "Task_assignedById_idx" ON "Task"("assignedById");

-- CreateIndex
CREATE INDEX "Task_status_idx" ON "Task"("status");

-- CreateIndex
CREATE INDEX "Task_expectedCompletionDate_idx" ON "Task"("expectedCompletionDate");

-- CreateIndex
CREATE INDEX "TaskQualityCriteria_taskId_idx" ON "TaskQualityCriteria"("taskId");

-- CreateIndex
CREATE UNIQUE INDEX "TaskQualityCriteria_taskId_criteriaId_key" ON "TaskQualityCriteria"("taskId", "criteriaId");

-- CreateIndex
CREATE INDEX "TimeEntry_employeeId_idx" ON "TimeEntry"("employeeId");

-- CreateIndex
CREATE INDEX "TimeEntry_taskId_idx" ON "TimeEntry"("taskId");

-- CreateIndex
CREATE INDEX "TimeEntry_entryDate_idx" ON "TimeEntry"("entryDate");

-- CreateIndex
CREATE INDEX "TimeEntry_status_idx" ON "TimeEntry"("status");

-- CreateIndex
CREATE UNIQUE INDEX "TimeEntry_employeeId_taskId_entryDate_key" ON "TimeEntry"("employeeId", "taskId", "entryDate");

-- CreateIndex
CREATE INDEX "EfficiencyScore_employeeId_idx" ON "EfficiencyScore"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "EfficiencyScore_employeeId_period_key" ON "EfficiencyScore"("employeeId", "period");

-- CreateIndex
CREATE INDEX "Asset_assetTypeId_idx" ON "Asset"("assetTypeId");

-- CreateIndex
CREATE INDEX "Asset_creatorId_idx" ON "Asset"("creatorId");

-- CreateIndex
CREATE INDEX "Asset_currentOwnerId_idx" ON "Asset"("currentOwnerId");

-- CreateIndex
CREATE INDEX "Asset_status_idx" ON "Asset"("status");

-- CreateIndex
CREATE INDEX "AssetOwnership_assetId_idx" ON "AssetOwnership"("assetId");

-- CreateIndex
CREATE INDEX "AssetOwnership_employeeId_idx" ON "AssetOwnership"("employeeId");

-- CreateIndex
CREATE INDEX "AssetVersion_assetId_idx" ON "AssetVersion"("assetId");

-- CreateIndex
CREATE INDEX "AssetDocumentation_assetId_idx" ON "AssetDocumentation"("assetId");

-- CreateIndex
CREATE UNIQUE INDEX "AssetDocumentation_assetId_docTypeId_key" ON "AssetDocumentation"("assetId", "docTypeId");

-- CreateIndex
CREATE INDEX "ContributionRecord_employeeId_idx" ON "ContributionRecord"("employeeId");

-- CreateIndex
CREATE INDEX "ContributionRecord_assetId_idx" ON "ContributionRecord"("assetId");

-- CreateIndex
CREATE INDEX "RewardNomination_assetId_idx" ON "RewardNomination"("assetId");

-- CreateIndex
CREATE INDEX "RewardNomination_status_idx" ON "RewardNomination"("status");

-- CreateIndex
CREATE INDEX "RewardRecord_nominationId_idx" ON "RewardRecord"("nominationId");

-- CreateIndex
CREATE INDEX "RewardRecord_employeeId_idx" ON "RewardRecord"("employeeId");

-- CreateIndex
CREATE INDEX "Beneficiary_employeeId_idx" ON "Beneficiary"("employeeId");

-- CreateIndex
CREATE INDEX "BeneficiaryDocument_beneficiaryId_idx" ON "BeneficiaryDocument"("beneficiaryId");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_idx" ON "AuditLog"("actorId");

-- CreateIndex
CREATE INDEX "AuditLog_module_idx" ON "AuditLog"("module");

-- CreateIndex
CREATE INDEX "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillMaster" ADD CONSTRAINT "SkillMaster_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "SkillCategoryMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QualityCriteriaMaster" ADD CONSTRAINT "QualityCriteriaMaster_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "TaskCategoryMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryBandMaster" ADD CONSTRAINT "SalaryBandMaster_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "SalaryGradeMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocRequirementConfig" ADD CONSTRAINT "DocRequirementConfig_assetTypeId_fkey" FOREIGN KEY ("assetTypeId") REFERENCES "AssetTypeMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocRequirementConfig" ADD CONSTRAINT "DocRequirementConfig_docTypeId_fkey" FOREIGN KEY ("docTypeId") REFERENCES "DocumentationTypeMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceThresholdConfig" ADD CONSTRAINT "ComplianceThresholdConfig_assetTypeId_fkey" FOREIGN KEY ("assetTypeId") REFERENCES "AssetTypeMaster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardFormulaConfig" ADD CONSTRAINT "RewardFormulaConfig_rewardTypeId_fkey" FOREIGN KEY ("rewardTypeId") REFERENCES "RewardTypeMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeneficiaryDocConfig" ADD CONSTRAINT "BeneficiaryDocConfig_beneficiaryTypeId_fkey" FOREIGN KEY ("beneficiaryTypeId") REFERENCES "BeneficiaryTypeMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "DepartmentMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_designationId_fkey" FOREIGN KEY ("designationId") REFERENCES "DesignationMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeQualification" ADD CONSTRAINT "EmployeeQualification_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeQualification" ADD CONSTRAINT "EmployeeQualification_qualificationTypeId_fkey" FOREIGN KEY ("qualificationTypeId") REFERENCES "QualificationMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeExperience" ADD CONSTRAINT "EmployeeExperience_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeExperience" ADD CONSTRAINT "EmployeeExperience_organizationTypeId_fkey" FOREIGN KEY ("organizationTypeId") REFERENCES "OrganizationTypeMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeExperienceType" ADD CONSTRAINT "EmployeeExperienceType_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "EmployeeExperience"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeExperienceType" ADD CONSTRAINT "EmployeeExperienceType_experienceTypeId_fkey" FOREIGN KEY ("experienceTypeId") REFERENCES "ExperienceTypeMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeSkill" ADD CONSTRAINT "EmployeeSkill_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeSkill" ADD CONSTRAINT "EmployeeSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "SkillMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeSkill" ADD CONSTRAINT "EmployeeSkill_proficiencyLevelId_fkey" FOREIGN KEY ("proficiencyLevelId") REFERENCES "SkillProficiencyMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeCertification" ADD CONSTRAINT "EmployeeCertification_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeCertification" ADD CONSTRAINT "EmployeeCertification_certificationId_fkey" FOREIGN KEY ("certificationId") REFERENCES "CertificationMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BpvScore" ADD CONSTRAINT "BpvScore_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BpvScore" ADD CONSTRAINT "BpvScore_configVersionId_fkey" FOREIGN KEY ("configVersionId") REFERENCES "BpvWeightConfig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryRecord" ADD CONSTRAINT "SalaryRecord_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryRecord" ADD CONSTRAINT "SalaryRecord_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "SalaryGradeMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "TaskCategoryMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_qualityRatingId_fkey" FOREIGN KEY ("qualityRatingId") REFERENCES "QualityRatingMaster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskQualityCriteria" ADD CONSTRAINT "TaskQualityCriteria_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskQualityCriteria" ADD CONSTRAINT "TaskQualityCriteria_criteriaId_fkey" FOREIGN KEY ("criteriaId") REFERENCES "QualityCriteriaMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_timeBlockId_fkey" FOREIGN KEY ("timeBlockId") REFERENCES "TimeBlockMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EfficiencyScore" ADD CONSTRAINT "EfficiencyScore_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EfficiencyScore" ADD CONSTRAINT "EfficiencyScore_configVersionId_fkey" FOREIGN KEY ("configVersionId") REFERENCES "EfficiencyWeightConfig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EfficiencyScore" ADD CONSTRAINT "EfficiencyScore_tierId_fkey" FOREIGN KEY ("tierId") REFERENCES "EfficiencyTierMaster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_assetTypeId_fkey" FOREIGN KEY ("assetTypeId") REFERENCES "AssetTypeMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_currentOwnerId_fkey" FOREIGN KEY ("currentOwnerId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetOwnership" ADD CONSTRAINT "AssetOwnership_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetOwnership" ADD CONSTRAINT "AssetOwnership_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetVersion" ADD CONSTRAINT "AssetVersion_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetDocumentation" ADD CONSTRAINT "AssetDocumentation_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetDocumentation" ADD CONSTRAINT "AssetDocumentation_docTypeId_fkey" FOREIGN KEY ("docTypeId") REFERENCES "DocumentationTypeMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContributionRecord" ADD CONSTRAINT "ContributionRecord_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContributionRecord" ADD CONSTRAINT "ContributionRecord_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContributionRecord" ADD CONSTRAINT "ContributionRecord_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardNomination" ADD CONSTRAINT "RewardNomination_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardNomination" ADD CONSTRAINT "RewardNomination_rewardTypeId_fkey" FOREIGN KEY ("rewardTypeId") REFERENCES "RewardTypeMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardNomination" ADD CONSTRAINT "RewardNomination_rewardBasisId_fkey" FOREIGN KEY ("rewardBasisId") REFERENCES "RewardBasisMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardRecord" ADD CONSTRAINT "RewardRecord_nominationId_fkey" FOREIGN KEY ("nominationId") REFERENCES "RewardNomination"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardRecord" ADD CONSTRAINT "RewardRecord_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Beneficiary" ADD CONSTRAINT "Beneficiary_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Beneficiary" ADD CONSTRAINT "Beneficiary_beneficiaryTypeId_fkey" FOREIGN KEY ("beneficiaryTypeId") REFERENCES "BeneficiaryTypeMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeneficiaryDocument" ADD CONSTRAINT "BeneficiaryDocument_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "Beneficiary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
