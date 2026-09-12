import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/audit";

const schema = z.object({ email: z.string().email() });

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (session.user.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id }, include: { tenant: true } });
  if (!user) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const newEmail = parsed.data.email;
  if (newEmail !== user.email) {
    const existing = await prisma.user.findUnique({
      where: { tenantId_email: { tenantId: user.tenantId, email: newEmail } },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Ya hay otro usuario de esa inmobiliaria con ese email" },
        { status: 409 }
      );
    }
  }

  const previousEmail = user.email;
  const updated = await prisma.user.update({
    where: { id },
    data: { email: newEmail },
  });

  await logAdminAction({
    actorUserId: session.user.id,
    actorEmail: session.user.email ?? "",
    action: "EDITAR_EMAIL_USUARIO",
    targetTenantId: user.tenantId,
    targetTenantSlug: user.tenant.slug,
    targetTenantName: user.tenant.name,
    targetUserEmail: updated.email,
    details: `Antes: ${previousEmail}`,
  });

  return NextResponse.json(updated);
}
