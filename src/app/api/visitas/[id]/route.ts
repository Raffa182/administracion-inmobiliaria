import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;

  const visit = await prisma.visit.findFirst({ where: { id, tenantId: session.user.tenantId } });
  if (!visit) return NextResponse.json({ error: "No encontrada" }, { status: 404 });

  await prisma.visit.delete({ where: { id: visit.id } });

  return NextResponse.json({ ok: true });
}
