import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/audit";

const patchSchema = z.object({
  active: z.boolean().optional(),
  name: z.string().min(2).optional(),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "El slug solo puede tener minúsculas, números y guiones")
    .optional(),
  plan: z.enum(["BASICO", "PRO", "ENTERPRISE"]).optional(),
  maxUsuarios: z.number().int().positive().nullable().optional(),
  maxPropiedades: z.number().int().positive().nullable().optional(),
});

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
  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const tenant = await prisma.tenant.findUnique({ where: { id } });
  if (!tenant) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  if (parsed.data.slug && parsed.data.slug !== tenant.slug) {
    const existing = await prisma.tenant.findUnique({ where: { slug: parsed.data.slug } });
    if (existing) {
      return NextResponse.json({ error: "Ese slug ya está en uso" }, { status: 409 });
    }
  }

  const updated = await prisma.tenant.update({
    where: { id },
    data: {
      active: parsed.data.active,
      name: parsed.data.name,
      slug: parsed.data.slug,
      plan: parsed.data.plan,
      maxUsuarios: parsed.data.maxUsuarios,
      maxPropiedades: parsed.data.maxPropiedades,
    },
  });

  const actions: string[] = [];
  if (parsed.data.active !== undefined && parsed.data.active !== tenant.active) {
    actions.push(parsed.data.active ? "REACTIVAR_TENANT" : "DESACTIVAR_TENANT");
  }
  if (
    (parsed.data.name && parsed.data.name !== tenant.name) ||
    (parsed.data.slug && parsed.data.slug !== tenant.slug)
  ) {
    actions.push("EDITAR_TENANT");
  }
  if (
    (parsed.data.plan !== undefined && parsed.data.plan !== tenant.plan) ||
    (parsed.data.maxUsuarios !== undefined && parsed.data.maxUsuarios !== tenant.maxUsuarios) ||
    (parsed.data.maxPropiedades !== undefined && parsed.data.maxPropiedades !== tenant.maxPropiedades)
  ) {
    actions.push("EDITAR_PLAN_TENANT");
  }

  for (const action of actions) {
    await logAdminAction({
      actorUserId: session.user.id,
      actorEmail: session.user.email ?? "",
      action,
      targetTenantId: updated.id,
      targetTenantSlug: updated.slug,
      targetTenantName: updated.name,
      details:
        action === "EDITAR_TENANT"
          ? `Antes: ${tenant.name} (${tenant.slug})`
          : action === "EDITAR_PLAN_TENANT"
          ? `Antes: plan ${tenant.plan}, máx. usuarios ${tenant.maxUsuarios ?? "sin límite"}, máx. propiedades ${tenant.maxPropiedades ?? "sin límite"}`
          : undefined,
    });
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  req: Request,
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

  // Borrado explícito en orden de dependencias (ver prisma/seed.ts: SQLite no
  // garantiza el orden de varios triggers ON DELETE CASCADE sobre el mismo padre).
  const where = { tenantId: tenant.id };
  await prisma.payment.deleteMany({ where });
  await prisma.visit.deleteMany({ where });
  await prisma.lead.deleteMany({ where });
  await prisma.personDocument.deleteMany({ where });
  await prisma.propertyDocument.deleteMany({ where });
  await prisma.propertyPhoto.deleteMany({ where });
  await prisma.expense.deleteMany({ where });
  await prisma.reservation.deleteMany({ where });
  await prisma.contract.deleteMany({ where });
  await prisma.sale.deleteMany({ where });
  await prisma.property.deleteMany({ where });
  await prisma.renter.deleteMany({ where });
  await prisma.buyer.deleteMany({ where });
  await prisma.owner.deleteMany({ where });
  await prisma.user.deleteMany({ where });
  await prisma.tenant.delete({ where: { id: tenant.id } });

  await logAdminAction({
    actorUserId: session.user.id,
    actorEmail: session.user.email ?? "",
    action: "BORRAR_TENANT",
    targetTenantId: tenant.id,
    targetTenantSlug: tenant.slug,
    targetTenantName: tenant.name,
  });

  return NextResponse.json({ ok: true });
}
