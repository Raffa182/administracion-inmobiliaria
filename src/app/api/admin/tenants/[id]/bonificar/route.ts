import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/audit";

const schema = z.object({
  bonificado: z.boolean(),
  motivo: z.string().max(200).optional(),
});

export async function POST(
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
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const tenant = await prisma.tenant.findUnique({ where: { id } });
  if (!tenant) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const updated = await prisma.tenant.update({
    where: { id },
    data: {
      bonificado: parsed.data.bonificado,
      bonificadoMotivo: parsed.data.bonificado ? parsed.data.motivo || null : null,
    },
  });

  await logAdminAction({
    actorUserId: session.user.id,
    actorEmail: session.user.email ?? "",
    action: parsed.data.bonificado ? "BONIFICAR_TENANT" : "QUITAR_BONIFICACION",
    targetTenantId: tenant.id,
    targetTenantSlug: tenant.slug,
    targetTenantName: tenant.name,
    details: parsed.data.bonificado ? parsed.data.motivo || undefined : undefined,
  });

  return NextResponse.json(updated);
}
