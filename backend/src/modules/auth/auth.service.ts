import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "../../lib/prisma";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  REFRESH_TOKEN_MAX_AGE,
} from "../../lib/jwt";
import { AppError } from "../../middleware/errorHandler";
import type { AuthUser } from "@hrms/types";

export async function loginService(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { employee: { select: { id: true } } },
  });

  if (!user || !user.isActive) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
  }

  const authUser: AuthUser = {
    id: user.id,
    role: user.role,
    emp: user.employeeId ?? undefined,
  };

  const accessToken = signAccessToken(authUser);
  const refreshTokenRaw = signRefreshToken(user.id);
  const tokenHash = crypto
    .createHash("sha256")
    .update(refreshTokenRaw)
    .digest("hex");

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_MAX_AGE),
    },
  });

  return { accessToken, refreshToken: refreshTokenRaw, authUser };
}

export async function refreshService(refreshToken: string) {
  let payload: { sub: string };
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError(401, "INVALID_TOKEN", "Invalid or expired refresh token");
  }

  const tokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const stored = await prisma.refreshToken.findFirst({
    where: {
      userId: payload.sub,
      tokenHash,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
    include: {
      user: { include: { employee: { select: { id: true } } } },
    },
  });

  if (!stored) {
    throw new AppError(401, "INVALID_TOKEN", "Refresh token not found or revoked");
  }

  // Rotate: revoke old, issue new
  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revokedAt: new Date() },
  });

  const authUser: AuthUser = {
    id: stored.user.id,
    role: stored.user.role,
    emp: stored.user.employeeId ?? undefined,
  };

  const newAccessToken = signAccessToken(authUser);
  const newRefreshTokenRaw = signRefreshToken(stored.user.id);
  const newHash = crypto
    .createHash("sha256")
    .update(newRefreshTokenRaw)
    .digest("hex");

  await prisma.refreshToken.create({
    data: {
      userId: stored.user.id,
      tokenHash: newHash,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_MAX_AGE),
    },
  });

  return { accessToken: newAccessToken, refreshToken: newRefreshTokenRaw };
}

export async function logoutService(refreshToken: string | undefined) {
  if (!refreshToken) return;

  const tokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function changePasswordService(
  userId: string,
  currentPassword: string,
  newPassword: string
) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

  const match = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!match) {
    throw new AppError(400, "INVALID_PASSWORD", "Current password is incorrect");
  }

  const newHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newHash },
  });

  // Revoke all refresh tokens to force re-login on all devices
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function getMeService(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
      employeeId: true,
      employee: {
        select: {
          fullName: true,
          employeeCode: true,
          department: { select: { name: true } },
          designation: { select: { title: true } },
        },
      },
    },
  });
  return user;
}
