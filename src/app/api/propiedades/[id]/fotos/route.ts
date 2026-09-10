import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  type: z.enum(["PROPIEDAD", "LLAVE"]),
  label: z.string().optional(),
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

  const property = await prisma.property.findFirst({
    where: { id, tenantId: session.user.tenantId },
  });
  if (!property) return NextResponse.json({ error: "No encontrada" }, { status: 404 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const photo = await prisma.propertyPhoto.create({
    data: {
      tenantId: session.user.tenantId,
      propertyId: property.id,
      type: parsed.data.type,
      label: parsed.data.label || undefined,
      fileName: parsed.data.fileName,
      fileData: parsed.data.fileData,
    },
  });

  return NextResponse.json(photo);
}
