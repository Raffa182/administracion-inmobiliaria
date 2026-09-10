import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { formatEUR, formatDate, periodLabel } from "@/lib/format";

export type ReceiptData = {
  tenantName: string;
  receiptNumber: string;
  propertyAddress: string;
  renterName: string;
  renterDni?: string | null;
  period: string;
  amount: number;
  paidDate: Date;
  concept?: string;
};

export async function generateReceiptPdf(data: ReceiptData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 420]); // A5-ish landscape-friendly receipt
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const margin = 40;
  let y = 420 - margin;

  const dark = rgb(0.06, 0.09, 0.16);
  const gray = rgb(0.4, 0.45, 0.53);
  const line = rgb(0.87, 0.89, 0.93);

  page.drawText(data.tenantName, { x: margin, y, size: 16, font: bold, color: dark });
  page.drawText("Recibo de alquiler", {
    x: margin,
    y: y - 20,
    size: 11,
    font,
    color: gray,
  });

  page.drawText(`N° ${data.receiptNumber}`, {
    x: 595.28 - margin - font.widthOfTextAtSize(`N° ${data.receiptNumber}`, 11),
    y,
    size: 11,
    font,
    color: gray,
  });
  const dateStr = formatDate(data.paidDate);
  page.drawText(dateStr, {
    x: 595.28 - margin - font.widthOfTextAtSize(dateStr, 11),
    y: y - 16,
    size: 11,
    font,
    color: gray,
  });

  y -= 55;
  page.drawLine({
    start: { x: margin, y },
    end: { x: 595.28 - margin, y },
    thickness: 1,
    color: line,
  });

  y -= 30;
  const rows: [string, string][] = [
    ["Propiedad", data.propertyAddress],
    ["Inquilino", data.renterName + (data.renterDni ? ` (DNI ${data.renterDni})` : "")],
    ["Período", periodLabel(data.period)],
    ["Concepto", data.concept ?? "Alquiler mensual"],
    ["Fecha de pago", formatDate(data.paidDate)],
  ];

  for (const [label, value] of rows) {
    page.drawText(label, { x: margin, y, size: 10, font, color: gray });
    page.drawText(value, { x: margin + 140, y, size: 11, font: bold, color: dark });
    y -= 26;
  }

  y -= 10;
  page.drawLine({
    start: { x: margin, y },
    end: { x: 595.28 - margin, y },
    thickness: 1,
    color: line,
  });

  y -= 40;
  page.drawText("Monto total pagado", { x: margin, y, size: 11, font, color: gray });
  const amountStr = formatEUR(data.amount);
  page.drawText(amountStr, {
    x: 595.28 - margin - bold.widthOfTextAtSize(amountStr, 22),
    y: y - 6,
    size: 22,
    font: bold,
    color: dark,
  });

  page.drawText(
    "Recibo generado automáticamente por la plataforma de Gestión Inmobiliaria.",
    { x: margin, y: 30, size: 8, font, color: gray }
  );

  return doc.save();
}
