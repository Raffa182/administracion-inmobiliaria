import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { currentPeriod } from "@/lib/format";
import { addDays } from "date-fns";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;

  const contract = await prisma.contract.findFirst({
    where: { id, tenantId: session.user.tenantId },
  });
  if (!contract) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const period = currentPeriod();

  const existing = await prisma.payment.findUnique({
    where: { contractId_period: { contractId: contract.id, period } },
  });
  if (existing) {
    return NextResponse.json({ error: "Ya existe un pago para este período" }, { status: 409 });
  }

  const payment = await prisma.payment.create({
    data: {
      tenantId: session.user.tenantId,
      contractId: contract.id,
      period,
      amount: contract.rentAmount,
      dueDate: addDays(new Date(), 10),
      status: "PENDIENTE",
    },
  });

  return NextResponse.json(payment);
}
