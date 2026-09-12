import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  fileName: z.string().min(1),
  fileData: z.string().min(1).startsWith("data:image/"),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "El logo debe ser una imagen" }, { status: 400 });
  }

  const tenant = await prisma.tenant.update({
    where: { id: session.user.tenantId },
    data: {
      logoFileName: parsed.data.fileName,
      logoFileData: parsed.data.fileData,
    },
    select: { logoFileName: true, logoFileData: true },
  });

  return NextResponse.json(tenant);
}
