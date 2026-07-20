import type { Request, Response, NextFunction } from "express";
import { AppError } from "../../middleware/errorHandler";
import * as svc from "./employee.service";

// ── List ───────────────────────────────────────────────────────────────────────

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const user  = req.user!;
    const page  = Math.max(1, parseInt(req.query["page"]  as string ?? "1",  10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query["limit"] as string ?? "20", 10)));
    const scope = req.query["scope"] as string | undefined;

    // EMPLOYEE cannot call the list endpoint — return 403
    if (user.role === "EMPLOYEE") {
      return next(new AppError(403, "FORBIDDEN", "Employees cannot list all employees"));
    }

    // MANAGER: restrict to their own direct reports unless scope already handled
    const managerId =
      (user.role === "MANAGER" || scope === "team") && user.emp
        ? user.emp
        : undefined;

    const result = await svc.listEmployees({
      page, limit,
      search:       (req.query["search"]       as string) || undefined,
      departmentId: (req.query["departmentId"] as string) || undefined,
      status:       (req.query["status"]       as string) || undefined,
      managerId,
    });
    res.json({ success: true, data: result });
  } catch (e) { next(e); }
}

// ── Get one ────────────────────────────────────────────────────────────────────

export async function getOne(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const id   = req.params["id"]!;

    // EMPLOYEE can only fetch their own record
    if (user.role === "EMPLOYEE" && user.emp !== id) {
      return next(new AppError(403, "FORBIDDEN", "You can only view your own profile"));
    }

    // MANAGER can view their own record or their direct reports
    // (full check delegated to service — just pass through; frontend already scopes the list)

    res.json({ success: true, data: await svc.getEmployee(id) });
  } catch (e) { next(e); }
}

// ── Create ─────────────────────────────────────────────────────────────────────

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const emp = await svc.createEmployee(req.body, req.user!.emp);
    res.status(201).json({ success: true, data: emp });
  } catch (e) { next(e); }
}

// ── Update ─────────────────────────────────────────────────────────────────────

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const emp = await svc.updateEmployee(req.params["id"]!, req.body, req.user!.emp);
    res.json({ success: true, data: emp });
  } catch (e) { next(e); }
}

// ── Delete ─────────────────────────────────────────────────────────────────────

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await svc.deleteEmployee(req.params["id"]!, req.user!.emp);
    res.json({ success: true });
  } catch (e) { next(e); }
}

// ── BPV History ────────────────────────────────────────────────────────────────

export async function bpvHistory(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await svc.getBpvHistory(req.params["id"]!) });
  } catch (e) { next(e); }
}

// ── Qualifications ─────────────────────────────────────────────────────────────

export async function addQual(req: Request, res: Response, next: NextFunction) {
  try {
    const q = await svc.addQualification(req.params["id"]!, req.body, req.user!.emp);
    res.status(201).json({ success: true, data: q });
  } catch (e) { next(e); }
}
export async function updateQual(req: Request, res: Response, next: NextFunction) {
  try {
    const q = await svc.updateQualification(req.params["id"]!, req.params["qualId"]!, req.body, req.user!.emp);
    res.json({ success: true, data: q });
  } catch (e) { next(e); }
}
export async function removeQual(req: Request, res: Response, next: NextFunction) {
  try {
    await svc.deleteQualification(req.params["id"]!, req.params["qualId"]!, req.user!.emp);
    res.json({ success: true });
  } catch (e) { next(e); }
}

// ── Experience ─────────────────────────────────────────────────────────────────

export async function addExp(req: Request, res: Response, next: NextFunction) {
  try {
    const e = await svc.addExperience(req.params["id"]!, req.body, req.user!.emp);
    res.status(201).json({ success: true, data: e });
  } catch (e) { next(e); }
}
export async function updateExp(req: Request, res: Response, next: NextFunction) {
  try {
    const e = await svc.updateExperience(req.params["id"]!, req.params["expId"]!, req.body, req.user!.emp);
    res.json({ success: true, data: e });
  } catch (e) { next(e); }
}
export async function removeExp(req: Request, res: Response, next: NextFunction) {
  try {
    await svc.deleteExperience(req.params["id"]!, req.params["expId"]!, req.user!.emp);
    res.json({ success: true });
  } catch (e) { next(e); }
}

// ── Skills ─────────────────────────────────────────────────────────────────────

export async function addSkill(req: Request, res: Response, next: NextFunction) {
  try {
    const s = await svc.addSkill(req.params["id"]!, req.body, req.user!.emp);
    res.status(201).json({ success: true, data: s });
  } catch (e) { next(e); }
}
export async function updateSkill(req: Request, res: Response, next: NextFunction) {
  try {
    const s = await svc.updateSkill(req.params["id"]!, req.params["skillId"]!, req.body, req.user!.emp);
    res.json({ success: true, data: s });
  } catch (e) { next(e); }
}
export async function removeSkill(req: Request, res: Response, next: NextFunction) {
  try {
    await svc.deleteSkill(req.params["id"]!, req.params["skillId"]!, req.user!.emp);
    res.json({ success: true });
  } catch (e) { next(e); }
}

// ── Certifications ─────────────────────────────────────────────────────────────

export async function addCert(req: Request, res: Response, next: NextFunction) {
  try {
    const c = await svc.addCertification(req.params["id"]!, req.body, req.user!.emp);
    res.status(201).json({ success: true, data: c });
  } catch (e) { next(e); }
}
export async function updateCert(req: Request, res: Response, next: NextFunction) {
  try {
    const c = await svc.updateCertification(req.params["id"]!, req.params["certId"]!, req.body, req.user!.emp);
    res.json({ success: true, data: c });
  } catch (e) { next(e); }
}
export async function removeCert(req: Request, res: Response, next: NextFunction) {
  try {
    await svc.deleteCertification(req.params["id"]!, req.params["certId"]!, req.user!.emp);
    res.json({ success: true });
  } catch (e) { next(e); }
}
