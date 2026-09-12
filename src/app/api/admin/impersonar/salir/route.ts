import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { logAdminAction } from "@/lib/audit";
import { encodeSessionToken, getSessionCookieName, isSecureCookieName } from "@/lib/impersonation";

export async function POST(req: NextRequest) {
  const session = await auth();
  const origin = session?.user?.adminOrigin;
  if (!origin) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  const cookieName = getSessionCookieName(req);
  const token = await encodeSessionToken(
    {
      sub: origin.id,
      name: origin.name,
      email: origin.email,
      tenantId: origin.tenantId,
      tenantSlug: origin.tenantSlug,
      tenantName: origin.tenantName,
      role: origin.role,
      adminOrigin: null,
    },
    cookieName
  );

  await logAdminAction({
    actorUserId: origin.id,
    actorEmail: origin.email,
    action: "IMPERSONAR_FIN",
    targetTenantId: session.user.tenantId,
    targetTenantSlug: session.user.tenantSlug,
    targetTenantName: session.user.tenantName,
    targetUserEmail: session.user.email ?? undefined,
  });

  const res = NextResponse.redirect(new URL("/admin", req.url));
  res.cookies.set(cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: isSecureCookieName(cookieName),
    maxAge: 30 * 24 * 60 * 60,
  });
  return res;
}
