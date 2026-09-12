import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/audit";

const schema = z.object({ password: z.string().min(6) });

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
    return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id },
    include: { tenant: true },
  });
  if (!user) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await prisma.user.update({ where: { id }, data: { passwordHash } });

  await logAdminAction({
    actorUserId: session.user.id,
    actorEmail: session.user.email ?? "",
    action: "RESETEAR_PASSWORD",
    targetTenantId: user.tenantId,
    targetTenantSlug: user.tenant.slug,
    targetTenantName: user.tenant.name,
    targetUserEmail: user.email,
  });

  return NextResponse.json({ ok: true });
}
