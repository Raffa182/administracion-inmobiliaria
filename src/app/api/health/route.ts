import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Endpoint público y liviano para monitoreo externo (uptime checks,
// healthcheck del reverse proxy). No expone nada sensible a propósito —
// el detalle completo está en /admin/estado, que sí requiere SUPERADMIN.
export async function GET() {
  let dbOk = true;
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    dbOk = false;
  }

  return NextResponse.json(
    {
      status: dbOk ? "ok" : "error",
      db: dbOk ? "ok" : "error",
      timestamp: new Date().toISOString(),
    },
    { status: dbOk ? 200 : 503 }
  );
}
