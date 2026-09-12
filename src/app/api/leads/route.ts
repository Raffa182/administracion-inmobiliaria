import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(2),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  propertyId: z.string().optional(),
  source: z.enum(["WEB", "IDEALISTA", "FOTOCASA", "TELEFONO", "REFERIDO", "OTRO"]).default("OTRO"),
  notes: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  const data = parsed.data;
  const tenantId = session.user.tenantId;

  if (data.propertyId) {
    const property = await prisma.property.findFirst({ where: { id: data.propertyId, tenantId } });
    if (!property) return NextResponse.json({ error: "Propiedad no encontrada" }, { status: 400 });
  }

  const lead = await prisma.lead.create({
    data: {
      tenantId,
      name: data.name,
      phone: data.phone || undefined,
      email: data.email || undefined,
      propertyId: data.propertyId || undefined,
      source: data.source,
      notes: data.notes || undefined,
    },
  });

  return NextResponse.json({ id: lead.id });
}
