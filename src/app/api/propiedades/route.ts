import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verificarLimiteTenant } from "@/lib/limites";

const schema = z.object({
  address: z.string().min(3),
  unit: z.string().optional(),
  city: z.string().optional(),
  type: z.string().min(2),
  listingType: z.enum(["ALQUILER", "VENTA", "ALQUILER_Y_VENTA"]),
  squareMeters: z.coerce.number().positive().optional().or(z.literal("")),
  rooms: z.coerce.number().int().nonnegative().optional().or(z.literal("")),
  petsAllowed: z.boolean().optional(),
  appliancesIncluded: z.boolean().optional(),
  furnished: z.boolean().optional(),
  hasParking: z.boolean().optional(),
  inUrbanizacion: z.boolean().optional(),
  complexName: z.string().optional(),
  askingRent: z.coerce.number().positive().optional().or(z.literal("")),
  askingSale: z.coerce.number().positive().optional().or(z.literal("")),
  notes: z.string().optional(),
  ownerName: z.string().optional(),
  ownerEmail: z.string().email().optional().or(z.literal("")),
  ownerPhone: z.string().optional(),
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

  const limite = await verificarLimiteTenant(tenantId, "propiedades");
  if (!limite.ok) {
    return NextResponse.json({ error: limite.error }, { status: 403 });
  }

  let ownerId: string | undefined;
  if (data.ownerName) {
    const owner = await prisma.owner.create({
      data: {
        tenantId,
        name: data.ownerName,
        email: data.ownerEmail || undefined,
        phone: data.ownerPhone || undefined,
      },
    });
    ownerId = owner.id;
  }

  const property = await prisma.property.create({
    data: {
      tenantId,
      address: data.address,
      unit: data.unit || undefined,
      city: data.city || undefined,
      type: data.type,
      listingType: data.listingType,
      squareMeters: data.squareMeters === "" ? undefined : data.squareMeters,
      rooms: data.rooms === "" ? undefined : data.rooms,
      petsAllowed: data.petsAllowed,
      appliancesIncluded: data.appliancesIncluded,
      furnished: data.furnished,
      hasParking: data.hasParking,
      inUrbanizacion: data.inUrbanizacion ?? false,
      complexName: data.complexName || undefined,
      askingRent: data.askingRent === "" ? undefined : data.askingRent,
      askingSale: data.askingSale === "" ? undefined : data.askingSale,
      notes: data.notes || undefined,
      ownerId,
    },
  });

  return NextResponse.json({ id: property.id });
}
