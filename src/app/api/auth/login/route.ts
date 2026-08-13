import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signAccessToken, signRefreshToken, type RoleName } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { logAudit } from "@/lib/audit";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "anonymous";
  const { success } = rateLimit(`login:${ip}`);
  if (!success) {
    return NextResponse.json({ error: "Terlalu banyak percobaan login. Coba lagi nanti." }, { status: 429 });
  }

  const parsed = LoginSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Email atau kata sandi tidak valid." }, { status: 400 });
  }
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email }, include: { role: true } });

  // Constant-shape response to avoid user-enumeration timing/content differences.
  if (!user || !user.isActive || !(await verifyPassword(password, user.passwordHash))) {
    await logAudit({ action: "LOGIN_FAILED", metadata: { email }, ipAddress: ip });
    return NextResponse.json({ error: "Email atau kata sandi salah." }, { status: 401 });
  }

  const accessToken = await signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role.name as RoleName,
  });
  const refreshToken = await signRefreshToken(user.id);

  await logAudit({ actorId: user.id, action: "LOGIN_SUCCESS", ipAddress: ip });

  const res = NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role.name },
    accessToken,
  });

  // Access token also set as a short-lived httpOnly cookie so middleware can
  // gate page routes; the same token is returned in the body for API calls
  // (attached as `Authorization: Bearer` from client-side fetches).
  res.cookies.set("access_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 15,
  });

  // Refresh token as httpOnly cookie — never exposed to client JS.
  res.cookies.set("refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/auth",
    maxAge: 60 * 60 * 24 * 7,
  });

  return res;
}
