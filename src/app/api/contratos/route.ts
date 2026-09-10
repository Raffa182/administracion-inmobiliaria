import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addMonths } from "date-fns";

const schema = z.object({
  propertyAddress: z.string().min(3),
  propertyType: z.string().min(2),
  renterName: z.string().min(2),
  renterDni: z.string().optional(),
  renterEmail: z.string().email().optional().or(z.literal("")),
  renterPhone: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
  rentAmount: z.coerce.number().positive(),
  adjustmentFrequencyMonths: z.coerce.number().int().positive(),
  contractFileName: z.string().optional(),
  contractFileData: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const tenantId = session.user.tenantId;

  const property = await prisma.property.create({
    data: {
      tenantId,
      address: data.propertyAddress,
      type: data.propertyType,
    },
  });

  const renter = await prisma.renter.create({
    data: {
      tenantId,
      name: data.renterName,
      dni: data.renterDni || undefined,
      email: data.renterEmail || undefined,
      phone: data.renterPhone || undefined,
    },
  });

  const startDate = new Date(data.startDate);
  const nextAdjustmentDate = addMonths(startDate, data.adjustmentFrequencyMonths);

  const contract = await prisma.contract.create({
    data: {
      tenantId,
      propertyId: property.id,
      renterId: renter.id,
      startDate,
      endDate: new Date(data.endDate),
      rentAmount: data.rentAmount,
      adjustmentFrequencyMonths: data.adjustmentFrequencyMonths,
      nextAdjustmentDate,
      contractFileName: data.contractFileName || undefined,
      contractFileData: data.contractFileData || undefined,
    },
  });

  return NextResponse.json({ id: contract.id });
}
