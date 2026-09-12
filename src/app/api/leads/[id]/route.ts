import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  stage: z.enum(["NUEVO", "CONTACTADO", "VISITA_AGENDADA", "NEGOCIANDO", "CERRADO", "PERDIDO"]).optional(),
  notes: z.string().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;

  const lead = await prisma.lead.findFirst({ where: { id, tenantId: session.user.tenantId } });
  if (!lead) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: "Nada para actualizar" }, { status: 400 });
  }

  const updated = await prisma.lead.update({
    where: { id: lead.id },
    data: parsed.data,
  });

  return NextResponse.json(updated);
}
