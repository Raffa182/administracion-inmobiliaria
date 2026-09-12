import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/audit";
import { generateBackupCodes, hashBackupCodes, verifyTwoFactorToken } from "@/lib/two-factor";

const schema = z.object({ code: z.string().min(6).max(6) });

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (session.user.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Ingresá el código de 6 dígitos" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.twoFactorSecret) {
    return NextResponse.json(
      { error: "Primero generá el código QR" },
      { status: 400 }
    );
  }

  if (!(await verifyTwoFactorToken(parsed.data.code.trim(), user.twoFactorSecret))) {
    return NextResponse.json({ error: "Código incorrecto" }, { status: 400 });
  }

  const backupCodes = generateBackupCodes();
  await prisma.user.update({
    where: { id: user.id },
    data: {
      twoFactorEnabled: true,
      twoFactorBackupCodes: await hashBackupCodes(backupCodes),
    },
  });

  await logAdminAction({
    actorUserId: user.id,
    actorEmail: user.email,
    action: "ACTIVAR_2FA",
    targetUserEmail: user.email,
  });

  return NextResponse.json({ backupCodes });
}
