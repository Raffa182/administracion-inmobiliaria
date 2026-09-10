import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  propertyId: z.string().optional(),
  propertyAddress: z.string().optional(),
  propertyType: z.string().optional(),
  renterId: z.string().optional(),
  renterName: z.string().optional(),
  renterDni: z.string().optional(),
  renterEmail: z.string().email().optional().or(z.literal("")),
  renterPhone: z.string().optional(),
  reservationDate: z.string(),
  amount: z.coerce.number().positive(),
  notes: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const tenantId = session.user.tenantId;

  let propertyId = data.propertyId;
  if (propertyId) {
    const existing = await prisma.property.findFirst({ where: { id: propertyId, tenantId } });
    if (!existing) return NextResponse.json({ error: "Propiedad no encontrada" }, { status: 400 });
  } else {
    if (!data.propertyAddress) {
      return NextResponse.json({ error: "Falta la dirección de la propiedad" }, { status: 400 });
    }
    const property = await prisma.property.create({
      data: { tenantId, address: data.propertyAddress, type: data.propertyType || "Piso" },
    });
    propertyId = property.id;
  }

  let renterId = data.renterId;
  if (renterId) {
    const existing = await prisma.renter.findFirst({ where: { id: renterId, tenantId } });
    if (!existing) return NextResponse.json({ error: "Inquilino no encontrado" }, { status: 400 });
  } else {
    if (!data.renterName) {
      return NextResponse.json({ error: "Falta el nombre del inquilino" }, { status: 400 });
    }
    const renter = await prisma.renter.create({
      data: {
        tenantId,
        name: data.renterName,
        dni: data.renterDni || undefined,
        email: data.renterEmail || undefined,
        phone: data.renterPhone || undefined,
      },
    });
    renterId = renter.id;
  }

  const reservation = await prisma.reservation.create({
    data: {
      tenantId,
      propertyId,
      renterId,
      reservationDate: new Date(data.reservationDate),
      amount: data.amount,
      notes: data.notes || undefined,
    },
  });

  return NextResponse.json({ id: reservation.id });
}
