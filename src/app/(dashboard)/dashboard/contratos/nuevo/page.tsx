import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ContratoForm } from "@/components/contrato-form";

export default async function NuevoContratoPage({
  searchParams,
}: {
  searchParams: Promise<{ propertyId?: string; renterId?: string }>;
}) {
  const session = await auth();
  const tenantId = session!.user.tenantId;
  const { propertyId, renterId } = await searchParams;

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

  const lockedProperty = propertyId ? properties.find((p) => p.id === propertyId) : undefined;
  const lockedRenter = renterId ? renters.find((r) => r.id === renterId) : undefined;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold text-slate-900">Nuevo contrato de alquiler</h1>
      <p className="text-sm text-slate-500 mt-1">
        Carga la propiedad, el inquilino y las condiciones del contrato
      </p>

      <ContratoForm
        properties={properties}
        renters={renters}
        lockedProperty={lockedProperty}
        lockedRenter={lockedRenter}
      />
    </div>
  );
}
