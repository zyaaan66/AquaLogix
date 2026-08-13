import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken, hasMinimumRole, type RoleName } from "@/lib/auth";

// Routes and the minimum role required to access them.
const PROTECTED_ROUTES: { prefix: string; minRole: RoleName }[] = [
  { prefix: "/dashboard", minRole: "PARTNER" },
  { prefix: "/partner-gateway", minRole: "PARTNER" },
  { prefix: "/settings", minRole: "OPERATIONS_MANAGER" },
  { prefix: "/case-study", minRole: "PARTNER" },
  { prefix: "/shipments", minRole: "PARTNER" },
  { prefix: "/inventory", minRole: "PARTNER" },
  { prefix: "/vendors", minRole: "PARTNER" },
];

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? "http://localhost:3000").split(",");

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // --- CORS for API routes ---
  if (pathname.startsWith("/api/")) {
    const origin = req.headers.get("origin");
    const res = NextResponse.next();
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
      res.headers.set("Access-Control-Allow-Origin", origin);
      res.headers.set("Access-Control-Allow-Credentials", "true");
    }

    // --- CSRF: require a matching custom header on state-changing requests from browsers ---
    // (defense-in-depth alongside SameSite=strict cookies; simple double-submit style check)
    if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method) && !pathname.startsWith("/api/auth/login")) {
      const csrfHeader = req.headers.get("x-requested-with");
      if (csrfHeader !== "AquaLogix") {
        return NextResponse.json({ error: "Permintaan ditolak (CSRF check gagal)." }, { status: 403 });
      }
    }
    return res;
  }

  // --- RBAC for page routes ---
  const match = PROTECTED_ROUTES.find((r) => pathname.startsWith(r.prefix));
  if (!match) return NextResponse.next();

  const token = req.cookies.get("access_token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const payload = await verifyAccessToken(token);
    if (!hasMinimumRole(payload.role, match.minRole)) {
      return NextResponse.redirect(new URL("/dashboard?error=forbidden", req.url));
    }
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/partner-gateway/:path*", "/settings/:path*", "/case-study/:path*", "/api/:path*", "/shipments/:path*", "/inventory/:path*", "/vendors/:path*"],
};
