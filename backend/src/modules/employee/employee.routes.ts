import { Router, type Request, type Response, type NextFunction } from "express";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { validate } from "../../middleware/validate";
import { AppError } from "../../middleware/errorHandler";
import {
  createEmployeeSchema, updateEmployeeSchema,
  addQualificationSchema, addExperienceSchema,
  addSkillSchema, addCertificationSchema,
} from "@hrms/validators";
import * as ctrl from "./employee.controller";

const router = Router();

// All employee routes require authentication
router.use(authenticate);

// ── Shared middleware ──────────────────────────────────────────────────────────

/**
 * Allows HR_ADMIN / SYSTEM_ADMIN through unconditionally.
 * Allows EMPLOYEE only if they are accessing their own record (req.params.id === req.user.emp).
 * Rejects everyone else.
 */
function selfOrHrAdmin(req: Request, _res: Response, next: NextFunction) {
  const user = req.user!;
  if (user.role === "HR_ADMIN" || user.role === "SYSTEM_ADMIN") return next();
  if (user.role === "EMPLOYEE" && user.emp === req.params.id) return next();
  return next(new AppError(403, "FORBIDDEN", "Insufficient permissions"));
}

// ── Employee CRUD ──────────────────────────────────────────────────────────────

// List: all authenticated roles — controller handles scope filtering
router.get  ("/",     ctrl.list);

// Create: HR_ADMIN / SYSTEM_ADMIN only
router.post ("/",     authorize("HR_ADMIN", "SYSTEM_ADMIN"), validate(createEmployeeSchema), ctrl.create);

// Get one: all authenticated roles — controller enforces EMPLOYEE self-only
router.get  ("/:id",  ctrl.getOne);

// Edit / Delete: HR_ADMIN / SYSTEM_ADMIN only
router.put  ("/:id",  authorize("HR_ADMIN", "SYSTEM_ADMIN"), validate(updateEmployeeSchema, "body"), ctrl.update);
router.delete("/:id", authorize("HR_ADMIN", "SYSTEM_ADMIN"), ctrl.remove);

// ── BPV History ────────────────────────────────────────────────────────────────
// Self or HR Admin can view BPV history
router.get("/:id/bpv", selfOrHrAdmin, ctrl.bpvHistory);

// ── Qualifications ─────────────────────────────────────────────────────────────
// EMPLOYEE can manage their OWN; HR_ADMIN / SYSTEM_ADMIN can manage anyone's
router.post  ("/:id/qualifications",         selfOrHrAdmin, validate(addQualificationSchema), ctrl.addQual);
router.delete("/:id/qualifications/:qualId", selfOrHrAdmin, ctrl.removeQual);

// ── Experience ─────────────────────────────────────────────────────────────────
router.post  ("/:id/experience",        selfOrHrAdmin, validate(addExperienceSchema), ctrl.addExp);
router.delete("/:id/experience/:expId", selfOrHrAdmin, ctrl.removeExp);

// ── Skills ─────────────────────────────────────────────────────────────────────
router.post  ("/:id/skills",           selfOrHrAdmin, validate(addSkillSchema), ctrl.addSkill);
router.delete("/:id/skills/:skillId",  selfOrHrAdmin, ctrl.removeSkill);

// ── Certifications ─────────────────────────────────────────────────────────────
router.post  ("/:id/certifications",          selfOrHrAdmin, validate(addCertificationSchema), ctrl.addCert);
router.delete("/:id/certifications/:certId",  selfOrHrAdmin, ctrl.removeCert);

export default router;
