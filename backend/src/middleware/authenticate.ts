import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../lib/jwt";
import { AppError } from "./errorHandler";
import type { AuthUser } from "@hrms/types";

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = req.cookies["access_token"] as string | undefined;
    if (!token) throw new AppError(401, "UNAUTHORIZED", "Authentication required");

    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (err) {
    if (err instanceof AppError) return next(err);
    next(new AppError(401, "INVALID_TOKEN", "Invalid or expired token"));
  }
}
