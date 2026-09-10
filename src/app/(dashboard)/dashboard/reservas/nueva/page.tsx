import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReservaForm } from "@/components/reserva-form";

export default async function NuevaReservaPage() {
  const session = await auth();
  const tenantId = session!.user.tenantId;

  const [properties, renters] = await Promise.all([
    prisma.property.findMany({
      where: { tenantId },
      select: { id: true, address: true },
      orderBy: { address: "asc" },
    }),
    prisma.renter.findMany({
      where: { tenantId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold text-slate-900">Nueva reserva</h1>
      <p className="text-sm text-slate-500 mt-1">
        Paso previo al contrato de alquiler, con la seña u honorarios acordados
      </p>

      <ReservaForm properties={properties} renters={renters} />
    </div>
  );
}
