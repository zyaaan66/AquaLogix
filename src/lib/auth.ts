import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

// NOTE: uses `jose` (not `jsonwebtoken`) because this file is imported from
// src/middleware.ts, which Next.js runs on the Edge Runtime — `jsonwebtoken`
// depends on Node's `crypto` module and silently fails to verify tokens there,
// which causes an infinite redirect back to /login after a successful login.
// `jose` uses the standard Web Crypto API, so it works in both runtimes.

export type RoleName = "ADMIN" | "OPERATIONS_MANAGER" | "ANALYST" | "PARTNER";

export interface AccessTokenPayload {
  sub: string; // userId
  email: string;
  role: RoleName;
}

const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL = "7d";

function getSecretKey(name: "JWT_SECRET" | "JWT_REFRESH_SECRET") {
  const value = process.env[name];
  if (!value) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(`${name} is not set`);
    }
    return new TextEncoder().encode("dev-only-insecure-secret-change-me");
  }
  return new TextEncoder().encode(value);
}

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, 12);
}

export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

export async function signAccessToken(payload: AccessTokenPayload) {
  return new SignJWT({ email: payload.email, role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_TTL)
    .sign(getSecretKey("JWT_SECRET"));
}

export async function signRefreshToken(userId: string) {
  return new SignJWT({ type: "refresh" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_TTL)
    .sign(getSecretKey("JWT_REFRESH_SECRET"));
}

export async function verifyAccessToken(token: string): Promise<AccessTokenPayload> {
  const { payload } = await jwtVerify(token, getSecretKey("JWT_SECRET"));
  return {
    sub: payload.sub as string,
    email: payload.email as string,
    role: payload.role as RoleName,
  };
}

export async function verifyRefreshToken(token: string): Promise<{ sub: string }> {
  const { payload } = await jwtVerify(token, getSecretKey("JWT_REFRESH_SECRET"));
  return { sub: payload.sub as string };
}

/** Role hierarchy for simple "at least this level" checks. */
const ROLE_RANK: Record<RoleName, number> = {
  PARTNER: 0,
  ANALYST: 1,
  OPERATIONS_MANAGER: 2,
  ADMIN: 3,
};

export function hasMinimumRole(role: RoleName, minimum: RoleName) {
  return ROLE_RANK[role] >= ROLE_RANK[minimum];
}
