import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LeadForm } from "@/components/lead-form";

export default async function NuevoLeadPage() {
  const session = await auth();
  const tenantId = session!.user.tenantId;

  const properties = await prisma.property.findMany({
    where: { tenantId },
    select: { id: true, address: true },
    orderBy: { address: "asc" },
  });

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Nuevo lead</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
        Alguien interesado en una propiedad, antes de agendar visita o reservar.
      </p>

      <LeadForm properties={properties} />
    </div>
  );
}
