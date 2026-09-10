import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  status: z.enum(["CANCELADA"]),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;

  const reservation = await prisma.reservation.findFirst({
    where: { id, tenantId: session.user.tenantId },
  });
  if (!reservation) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  if (reservation.status !== "ACTIVA") {
    return NextResponse.json({ error: "La reserva ya no está activa" }, { status: 409 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const updated = await prisma.reservation.update({
    where: { id: reservation.id },
    data: { status: parsed.data.status },
  });

  return NextResponse.json(updated);
}
