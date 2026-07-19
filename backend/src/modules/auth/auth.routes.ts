import { Router } from "express";
import { login, refresh, logout, changePassword, getMe } from "./auth.controller";
import { authenticate } from "../../middleware/authenticate";
import { validate } from "../../middleware/validate";
import { loginSchema, changePasswordSchema } from "@hrms/validators";

const router = Router();

// POST /api/v1/auth/login
router.post("/login", validate(loginSchema), login);

// POST /api/v1/auth/refresh
router.post("/refresh", refresh);

// POST /api/v1/auth/logout
router.post("/logout", logout);

// GET /api/v1/auth/me  (requires auth)
router.get("/me", authenticate, getMe);

// PATCH /api/v1/auth/change-password  (requires auth)
router.patch("/change-password", authenticate, validate(changePasswordSchema), changePassword);

export default router;
