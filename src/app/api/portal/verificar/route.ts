import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPortalToken } from "@/lib/portal-token";
import { encodePortalSession, PORTAL_COOKIE_NAME } from "@/lib/portal-session";

// Location relativo a propósito (nunca new URL(path, req.url)): esta es
// una navegación real del navegador al hacer click en el link del email,
// así que el browser resuelve el relativo contra su propio origen — sin
// depender de headers x-forwarded-* que un proxy/túnel puede traer mal.
function redirectRelative(path: string) {
  return new NextResponse(null, { status: 302, headers: { Location: path } });
}

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("token");
  if (!raw) return redirectRelative("/portal/entrar?error=invalid");

  const hash = hashPortalToken(raw);
  const record = await prisma.portalLoginToken.findUnique({ where: { tokenHash: hash } });
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return redirectRelative("/portal/entrar?error=invalid");
  }

  const tenant = await prisma.tenant.findUnique({ where: { id: record.tenantId } });
  if (!tenant || !tenant.active) return redirectRelative("/portal/entrar?error=invalid");

  const person =
    record.personType === "RENTER"
      ? await prisma.renter.findUnique({ where: { id: record.personId } })
      : await prisma.buyer.findUnique({ where: { id: record.personId } });
  if (!person || !person.email) return redirectRelative("/portal/entrar?error=invalid");

  await prisma.portalLoginToken.update({ where: { id: record.id }, data: { usedAt: new Date() } });

  const sessionToken = await encodePortalSession({
    tenantId: tenant.id,
    tenantSlug: tenant.slug,
    tenantName: tenant.name,
    personType: record.personType,
    personId: person.id,
    name: person.name,
    email: person.email,
  });

  const res = redirectRelative("/portal");
  res.cookies.set(PORTAL_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
