import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyRefreshToken, signAccessToken, type RoleName } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get("refresh_token")?.value;
  if (!refreshToken) {
    return NextResponse.json({ error: "Tidak ada sesi aktif." }, { status: 401 });
  }

  try {
    const { sub } = await verifyRefreshToken(refreshToken);
    const user = await prisma.user.findUnique({ where: { id: sub }, include: { role: true } });
    if (!user || !user.isActive) {
      return NextResponse.json({ error: "Sesi tidak valid." }, { status: 401 });
    }

    const accessToken = await signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role.name as RoleName,
    });

    const res = NextResponse.json({ accessToken });
    res.cookies.set("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 15,
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Sesi kedaluwarsa. Silakan login kembali." }, { status: 401 });
  }
}
