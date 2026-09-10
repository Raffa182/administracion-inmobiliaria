import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  status: z.enum(["DISPONIBLE", "RESERVADA", "VENDIDA", "CANCELADA"]),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;

  const sale = await prisma.sale.findFirst({
    where: { id, tenantId: session.user.tenantId },
  });
  if (!sale) return NextResponse.json({ error: "No encontrada" }, { status: 404 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const updated = await prisma.sale.update({
    where: { id: sale.id },
    data: {
      status: parsed.data.status,
      saleDate: parsed.data.status === "VENDIDA" ? new Date() : sale.saleDate,
    },
  });

  return NextResponse.json(updated);
}
