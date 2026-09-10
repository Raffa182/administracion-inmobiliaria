import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  type: z.enum(["DNI", "NOMINA", "CONTRATO_TRABAJO", "OTRO"]),
  fileName: z.string().min(1),
  fileData: z.string().min(1),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;

  const renter = await prisma.renter.findFirst({
    where: { id, tenantId: session.user.tenantId },
  });
  if (!renter) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const document = await prisma.personDocument.create({
    data: {
      tenantId: session.user.tenantId,
      renterId: renter.id,
      type: parsed.data.type,
      fileName: parsed.data.fileName,
      fileData: parsed.data.fileData,
    },
  });

  return NextResponse.json(document);
}
