import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (token) {
    try {
      const payload = await verifyAccessToken(token);
      await logAudit({ actorId: payload.sub, action: "LOGOUT" });
    } catch {
      // token already invalid/expired — nothing to log against
    }
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set("access_token", "", { path: "/", maxAge: 0 });
  res.cookies.set("refresh_token", "", { path: "/api/auth", maxAge: 0 });
  return res;
}
