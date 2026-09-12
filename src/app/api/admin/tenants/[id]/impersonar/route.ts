import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/audit";
import { encodeSessionToken, getSessionCookieName, isSecureCookieName } from "@/lib/impersonation";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (session.user.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const tenant = await prisma.tenant.findUnique({ where: { id } });
  if (!tenant) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  if (!tenant.active) {
    return NextResponse.json({ error: "Esa inmobiliaria está desactivada" }, { status: 400 });
  }

  const targetUser = await prisma.user.findFirst({
    where: { tenantId: tenant.id, role: "ADMIN" },
    orderBy: { createdAt: "asc" },
  });
  if (!targetUser) {
    return NextResponse.json(
      { error: "Esa inmobiliaria no tiene ningún usuario ADMIN para entrar como él." },
      { status: 400 }
    );
  }

  const cookieName = getSessionCookieName(req);
  const token = await encodeSessionToken(
    {
      sub: targetUser.id,
      name: targetUser.name,
      email: targetUser.email,
      tenantId: tenant.id,
      tenantSlug: tenant.slug,
      tenantName: tenant.name,
      role: targetUser.role,
      adminOrigin: {
        id: session.user.id,
        email: session.user.email ?? "",
        name: session.user.name ?? "",
        tenantId: session.user.tenantId,
        tenantSlug: session.user.tenantSlug,
        tenantName: session.user.tenantName,
        role: session.user.role,
      },
    },
    cookieName
  );

  await logAdminAction({
    actorUserId: session.user.id,
    actorEmail: session.user.email ?? "",
    action: "IMPERSONAR_INICIO",
    targetTenantId: tenant.id,
    targetTenantSlug: tenant.slug,
    targetTenantName: tenant.name,
    targetUserEmail: targetUser.email,
  });

  const res = NextResponse.redirect(new URL("/dashboard", req.url));
  res.cookies.set(cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: isSecureCookieName(cookieName),
    maxAge: 30 * 24 * 60 * 60,
  });
  return res;
}
