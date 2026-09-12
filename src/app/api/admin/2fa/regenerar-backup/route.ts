import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/audit";
import { generateBackupCodes, hashBackupCodes } from "@/lib/two-factor";

const schema = z.object({ password: z.string().min(1) });

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (session.user.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Ingresá tu contraseña" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.twoFactorEnabled) {
    return NextResponse.json({ error: "La verificación en dos pasos no está activada" }, { status: 400 });
  }

  const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!valid) return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 400 });

  const backupCodes = generateBackupCodes();
  await prisma.user.update({
    where: { id: user.id },
    data: { twoFactorBackupCodes: await hashBackupCodes(backupCodes) },
  });

  await logAdminAction({
    actorUserId: user.id,
    actorEmail: user.email,
    action: "REGENERAR_CODIGOS_2FA",
    targetUserEmail: user.email,
  });

  return NextResponse.json({ backupCodes });
}
