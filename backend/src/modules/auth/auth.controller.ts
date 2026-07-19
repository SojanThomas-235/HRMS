import type { Request, Response, NextFunction } from "express";
import {
  loginService,
  refreshService,
  logoutService,
  changePasswordService,
  getMeService,
} from "./auth.service";
import { COOKIE_OPTS, ACCESS_TOKEN_MAX_AGE, REFRESH_TOKEN_MAX_AGE } from "../../lib/jwt";

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const { accessToken, refreshToken, authUser } = await loginService(email, password);

    res
      .cookie("access_token", accessToken, {
        ...COOKIE_OPTS,
        maxAge: ACCESS_TOKEN_MAX_AGE,
      })
      .cookie("refresh_token", refreshToken, {
        ...COOKIE_OPTS,
        maxAge: REFRESH_TOKEN_MAX_AGE,
      })
      .json({ success: true, data: authUser });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const refreshToken = req.cookies["refresh_token"] as string | undefined;
    if (!refreshToken) {
      return res.status(401).json({ success: false, error: { code: "NO_TOKEN", message: "Refresh token missing" } });
    }

    const { accessToken, refreshToken: newRefreshToken } = await refreshService(refreshToken);

    res
      .cookie("access_token", accessToken, {
        ...COOKIE_OPTS,
        maxAge: ACCESS_TOKEN_MAX_AGE,
      })
      .cookie("refresh_token", newRefreshToken, {
        ...COOKIE_OPTS,
        maxAge: REFRESH_TOKEN_MAX_AGE,
      })
      .json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const refreshToken = req.cookies["refresh_token"] as string | undefined;
    await logoutService(refreshToken);

    res
      .clearCookie("access_token", COOKIE_OPTS)
      .clearCookie("refresh_token", COOKIE_OPTS)
      .json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { currentPassword, newPassword } = req.body as {
      currentPassword: string;
      newPassword: string;
    };
    await changePasswordService(req.user!.id, currentPassword, newPassword);

    // Clear cookies — user must re-login
    res
      .clearCookie("access_token", COOKIE_OPTS)
      .clearCookie("refresh_token", COOKIE_OPTS)
      .json({ success: true, message: "Password changed. Please log in again." });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await getMeService(req.user!.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
