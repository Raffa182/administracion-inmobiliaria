import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;

  const payment = await prisma.payment.findFirst({
    where: { id, tenantId: session.user.tenantId },
  });
  if (!payment?.receiptFileData) {
    return NextResponse.json({ error: "Recibo no disponible" }, { status: 404 });
  }

  const base64 = payment.receiptFileData.split(",")[1];
  const bytes = Buffer.from(base64, "base64");

  return new NextResponse(bytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${payment.receiptFileName ?? "recibo.pdf"}"`,
    },
  });
}
