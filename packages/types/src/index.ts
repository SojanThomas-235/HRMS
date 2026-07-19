// ── Enums ──────────────────────────────────────────────────────────
export type UserRole =
  | "EMPLOYEE"
  | "MANAGER"
  | "HR_ADMIN"
  | "FINANCE_ADMIN"
  | "SYSTEM_ADMIN";

export type EmployeeStatus = "ACTIVE" | "ON_NOTICE" | "EXITED";

export type TaskStatus =
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "PENDING_REVIEW"
  | "ACCEPTED"
  | "RETURNED"
  | "OVERDUE";

export type TaskCompletionStatus =
  | "FULLY_COMPLETED"
  | "PARTIALLY_COMPLETED"
  | "BLOCKED";

export type TimeEntryStatus = "PENDING" | "APPROVED" | "REJECTED";

export type AssetStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "ACTIVE"
  | "ARCHIVED"
  | "DEPRECATED";

export type QualificationVerificationStatus = "PENDING" | "VERIFIED" | "FLAGGED";

export type BeneficiaryStatus = "PENDING" | "ACTIVE" | "REJECTED" | "REMOVED";

export type RewardNominationStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "REJECTED";

export type RewardPaymentStatus = "PENDING" | "SCHEDULED" | "PAID";

export type VersionType = "MAJOR" | "MINOR";

// ── Common ─────────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ApiResponse<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// ── Auth ───────────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  role: UserRole;
  emp: string; // employeeId
}

export interface LoginResponse {
  id: string;
  role: UserRole;
  fullName: string;
  employeeId: string;
}

// ── Employee ───────────────────────────────────────────────────────
export interface Employee {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string;
  status: EmployeeStatus;
  departmentId: string;
  designationId: string;
  managerId?: string;
  dateOfJoining: string;
  dateOfBirth?: string;
  phone?: string;
  bpvScore?: number;
  createdAt: string;
  updatedAt: string;
}

// ── BPV ────────────────────────────────────────────────────────────
export interface BpvScore {
  id: string;
  employeeId: string;
  score: number;
  educationScore: number;
  experienceScore: number;
  orgScore: number;
  skillScore: number;
  certScore: number;
  configVersionId: string;
  triggerReason: string;
  triggeredBy: string;
  calculatedAt: string;
}

// ── Task ───────────────────────────────────────────────────────────
export interface Task {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  assigneeId: string;
  assignedById: string;
  status: TaskStatus;
  expectedCompletionDate: string;
  qualityRating?: number;
  createdAt: string;
}

// ── Asset ──────────────────────────────────────────────────────────
export interface Asset {
  id: string;
  name: string;
  description?: string;
  assetTypeId: string;
  creatorId: string;
  currentOwnerId: string;
  status: AssetStatus;
  currentVersion: string;
  complianceScore: number;
  createdAt: string;
}
