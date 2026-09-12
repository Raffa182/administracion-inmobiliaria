import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { VisitaForm } from "@/components/visita-form";

export default async function NuevaVisitaPage() {
  const session = await auth();
  const tenantId = session!.user.tenantId;

  const [properties, leads] = await Promise.all([
    prisma.property.findMany({
      where: { tenantId },
      select: { id: true, address: true },
      orderBy: { address: "asc" },
    }),
    prisma.lead.findMany({
      where: { tenantId, stage: { not: "PERDIDO" } },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Nueva visita</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
        Agendá una visita a una propiedad, con o sin un lead asociado.
      </p>

      <div className="mt-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
        <VisitaForm properties={properties} leads={leads} redirectTo="/dashboard/agenda" />
      </div>
    </div>
  );
}
