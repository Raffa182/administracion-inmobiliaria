import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { VentaForm } from "@/components/venta-form";

export default async function NuevaVentaPage() {
  const session = await auth();
  const tenantId = session!.user.tenantId;

  const [properties, buyers] = await Promise.all([
    prisma.property.findMany({
      where: { tenantId },
      select: { id: true, address: true },
      orderBy: { address: "asc" },
    }),
    prisma.buyer.findMany({
      where: { tenantId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold text-slate-900">Nueva venta</h1>
      <p className="text-sm text-slate-500 mt-1">
        Propiedad, comprador (si ya lo tenés) y precio de la operación
      </p>

      <VentaForm properties={properties} buyers={buyers} />
    </div>
  );
}
