import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  propertyId: z.string().min(1),
  leadId: z.string().optional(),
  scheduledAt: z.string(),
  durationMinutes: z.coerce.number().int().positive().default(30),
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

  const property = await prisma.property.findFirst({ where: { id: data.propertyId, tenantId } });
  if (!property) return NextResponse.json({ error: "Propiedad no encontrada" }, { status: 400 });

  if (data.leadId) {
    const lead = await prisma.lead.findFirst({ where: { id: data.leadId, tenantId } });
    if (!lead) return NextResponse.json({ error: "Lead no encontrado" }, { status: 400 });
  }

  const visit = await prisma.visit.create({
    data: {
      tenantId,
      propertyId: data.propertyId,
      leadId: data.leadId || undefined,
      scheduledAt: new Date(data.scheduledAt),
      durationMinutes: data.durationMinutes,
      notes: data.notes || undefined,
    },
  });

  // Agendar una visita es la señal natural de que el lead avanzó de etapa,
  // salvo que ya esté más adelante en el pipeline (negociando, cerrado, etc.).
  if (data.leadId) {
    await prisma.lead.updateMany({
      where: { id: data.leadId, tenantId, stage: { in: ["NUEVO", "CONTACTADO"] } },
      data: { stage: "VISITA_AGENDADA" },
    });
  }

  return NextResponse.json({ id: visit.id });
}
