import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;

  const target = await prisma.user.findFirst({
    where: { id, tenantId: session.user.tenantId },
  });
  if (!target) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  if (target.id === session.user.id) {
    return NextResponse.json({ error: "No puedes eliminar tu propio usuario" }, { status: 400 });
  }

  if (target.role === "ADMIN") {
    const otherAdmins = await prisma.user.count({
      where: { tenantId: session.user.tenantId, role: "ADMIN", id: { not: target.id } },
    });
    if (otherAdmins === 0) {
      return NextResponse.json(
        { error: "No puedes eliminar al único administrador" },
        { status: 400 }
      );
    }
  }

  await prisma.user.delete({ where: { id: target.id } });

  return NextResponse.json({ ok: true });
}
