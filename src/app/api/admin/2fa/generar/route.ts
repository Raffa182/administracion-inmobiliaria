import { NextResponse } from "next/server";
import qrcode from "qrcode";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateTwoFactorSecret, twoFactorKeyUri } from "@/lib/two-factor";

// Genera y guarda un secreto "pendiente": no activa 2FA todavía, eso pasa
// recién en /activar cuando el usuario confirma que pudo generar un código
// válido con la app (así un setup a medio hacer nunca bloquea el login).
export async function POST() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (session.user.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const secret = generateTwoFactorSecret();
  await prisma.user.update({
    where: { id: session.user.id },
    data: { twoFactorSecret: secret, twoFactorEnabled: false, twoFactorBackupCodes: null },
  });

  const otpauthUrl = twoFactorKeyUri(session.user.email ?? "", secret);
  const qrDataUrl = await qrcode.toDataURL(otpauthUrl);

  return NextResponse.json({ secret, qrDataUrl });
}
