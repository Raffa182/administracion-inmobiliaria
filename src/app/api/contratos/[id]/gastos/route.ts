import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  type: z.enum(["ABL", "ARREGLO", "EXPENSAS", "SEGURO", "OTRO"]),
  description: z.string().min(2),
  amount: z.coerce.number().positive(),
  date: z.string(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;

  const contract = await prisma.contract.findFirst({
    where: { id, tenantId: session.user.tenantId },
  });
  if (!contract) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const expense = await prisma.expense.create({
    data: {
      tenantId: session.user.tenantId,
      contractId: contract.id,
      propertyId: contract.propertyId,
      type: parsed.data.type,
      description: parsed.data.description,
      amount: parsed.data.amount,
      date: new Date(parsed.data.date),
    },
  });

  return NextResponse.json(expense);
}
