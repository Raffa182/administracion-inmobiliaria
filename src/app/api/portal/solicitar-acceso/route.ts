import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPortalToken } from "@/lib/portal-token";
import { sendMail } from "@/lib/mail";

// El link del email necesita una URL absoluta de verdad (no es una
// navegación relativa del navegador): se arma con APP_URL, nunca con los
// headers de la request, que detrás de un proxy/túnel pueden traer un
// host/proto incorrecto. Si falta la variable, usamos el origen de la
// request como último recurso (sirve en local) pero avisamos en el log,
// porque en producción detrás de un proxy puede salir mal.
function publicOrigin(req: NextRequest) {
  const configured = process.env.APP_URL?.replace(/\/$/, "");
  if (configured) return configured;
  console.warn(
    "[portal] APP_URL no está configurado: usando el origen de la request, puede ser incorrecto detrás de un proxy/túnel."
  );
  return req.nextUrl.origin;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const tenantSlug =
    typeof body?.tenantSlug === "string" ? body.tenantSlug.trim().toLowerCase() : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  // Misma respuesta siempre exista o no la cuenta, para no filtrar datos.
  const genericResponse = NextResponse.json({
    ok: true,
    message:
      "Si el email coincide con un inquilino o comprador de esa inmobiliaria, te enviamos un link de acceso.",
  });

  if (!tenantSlug || !email) return genericResponse;

  const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
  if (!tenant || !tenant.active) return genericResponse;

  const renter = await prisma.renter.findFirst({ where: { tenantId: tenant.id, email } });
  const buyer = !renter
    ? await prisma.buyer.findFirst({ where: { tenantId: tenant.id, email } })
    : null;

  const person = renter
    ? { type: "RENTER" as const, id: renter.id, name: renter.name, email: renter.email }
    : buyer
    ? { type: "BUYER" as const, id: buyer.id, name: buyer.name, email: buyer.email }
    : null;

  if (!person || !person.email) return genericResponse;

  const { raw, hash } = createPortalToken();
  await prisma.portalLoginToken.create({
    data: {
      tenantId: tenant.id,
      personType: person.type,
      personId: person.id,
      tokenHash: hash,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    },
  });

  const origin = publicOrigin(req);
  const link = `${origin}/api/portal/verificar?token=${raw}`;

  await sendMail({
    to: person.email,
    subject: `Tu acceso al portal de ${tenant.name}`,
    text: `Hola ${person.name},\n\nEntrá a tu portal con este link (válido 15 minutos):\n${link}\n\nSi no lo pediste vos, ignorá este email.`,
    html: `<p>Hola ${person.name},</p><p>Entrá a tu portal con este link (válido 15 minutos):</p><p><a href="${link}">${link}</a></p><p>Si no lo pediste vos, ignorá este email.</p>`,
  });

  return genericResponse;
}
