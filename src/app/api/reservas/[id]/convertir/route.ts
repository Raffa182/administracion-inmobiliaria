import { NextResponse } from "next/server";
import { z } from "zod";
import { addMonths } from "date-fns";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  contractType: z.enum(["LARGA_TEMPORADA", "TEMPORADA"]),
  startDate: z.string(),
  endDate: z.string(),
  rentAmount: z.coerce.number().positive(),
  adjustmentFrequencyMonths: z.coerce.number().int().positive(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const tenantId = session.user.tenantId;

  const reservation = await prisma.reservation.findFirst({
    where: { id, tenantId },
  });
  if (!reservation) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  if (reservation.status !== "ACTIVA") {
    return NextResponse.json({ error: "La reserva ya no está activa" }, { status: 409 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  const data = parsed.data;
  const startDate = new Date(data.startDate);

  const contract = await prisma.contract.create({
    data: {
      tenantId,
      propertyId: reservation.propertyId,
      renterId: reservation.renterId,
      contractType: data.contractType,
      startDate,
      endDate: new Date(data.endDate),
      rentAmount: data.rentAmount,
      adjustmentFrequencyMonths: data.adjustmentFrequencyMonths,
      nextAdjustmentDate: addMonths(startDate, data.adjustmentFrequencyMonths),
    },
  });

  await prisma.reservation.update({
    where: { id: reservation.id },
    data: { status: "CONVERTIDA", contractId: contract.id },
  });

  return NextResponse.json({ id: contract.id });
}
