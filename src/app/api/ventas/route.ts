import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  propertyId: z.string().optional(),
  propertyAddress: z.string().optional(),
  propertyType: z.string().optional(),
  buyerId: z.string().optional(),
  buyerName: z.string().optional(),
  buyerDni: z.string().optional(),
  buyerEmail: z.string().email().optional().or(z.literal("")),
  buyerPhone: z.string().optional(),
  price: z.coerce.number().positive(),
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
      data: {
        tenantId,
        address: data.propertyAddress,
        type: data.propertyType || "Piso",
        listingType: "VENTA",
      },
    });
    propertyId = property.id;
  }

  let buyerId = data.buyerId;
  if (!buyerId && data.buyerName) {
    const buyer = await prisma.buyer.create({
      data: {
        tenantId,
        name: data.buyerName,
        dni: data.buyerDni || undefined,
        email: data.buyerEmail || undefined,
        phone: data.buyerPhone || undefined,
      },
    });
    buyerId = buyer.id;
  } else if (buyerId) {
    const existing = await prisma.buyer.findFirst({ where: { id: buyerId, tenantId } });
    if (!existing) return NextResponse.json({ error: "Comprador no encontrado" }, { status: 400 });
  }

  const sale = await prisma.sale.create({
    data: {
      tenantId,
      propertyId,
      buyerId: buyerId || undefined,
      price: data.price,
      status: buyerId ? "RESERVADA" : "DISPONIBLE",
      notes: data.notes || undefined,
    },
  });

  return NextResponse.json({ id: sale.id });
}
