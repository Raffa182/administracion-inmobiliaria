import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateReceiptPdf } from "@/lib/receipt";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;

  const payment = await prisma.payment.findFirst({
    where: { id, tenantId: session.user.tenantId },
    include: {
      contract: { include: { property: true, renter: true } },
    },
  });
  if (!payment) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const paidDate = new Date();
  const receiptNumber = `${payment.contract.tenantId.slice(-4).toUpperCase()}-${payment.period.replace("-", "")}-${payment.id.slice(-4).toUpperCase()}`;

  const pdfBytes = await generateReceiptPdf({
    tenantName: session.user.tenantName,
    receiptNumber,
    propertyAddress: payment.contract.property.address,
    renterName: payment.contract.renter.name,
    renterDni: payment.contract.renter.dni,
    period: payment.period,
    amount: payment.amount,
    paidDate,
  });

  const receiptFileData = `data:application/pdf;base64,${Buffer.from(pdfBytes).toString("base64")}`;
  const receiptFileName = `recibo-${payment.period}-${receiptNumber}.pdf`;

  const updated = await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: "PAGADO",
      paidDate,
      receiptFileData,
      receiptFileName,
    },
  });

  return NextResponse.json({ id: updated.id, receiptFileName });
}
