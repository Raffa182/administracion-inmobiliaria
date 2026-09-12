import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { leadPipelineStages, leadStageLabels, leadSourceLabels } from "@/lib/labels";
import { LeadStageSelect } from "@/components/lead-stage-select";

export default async function LeadsPage() {
  const session = await auth();
  const tenantId = session!.user.tenantId;

  const [leads, perdidos] = await Promise.all([
    prisma.lead.findMany({
      where: { tenantId, stage: { not: "PERDIDO" } },
      include: { property: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.lead.count({ where: { tenantId, stage: "PERDIDO" } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Leads</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Interesados en tus propiedades, de la primera consulta al contrato.
          </p>
        </div>
        <Link
          href="/dashboard/leads/nuevo"
          className="rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-medium px-4 py-2 hover:bg-slate-800 dark:hover:bg-slate-200 transition"
        >
          + Nuevo lead
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {leadPipelineStages.map((stage) => {
            const stageLeads = leads.filter((l) => l.stage === stage);
            return (
              <div key={stage} className="min-w-0 bg-slate-100 dark:bg-slate-900 rounded-2xl p-3 flex flex-col gap-2.5">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                    {leadStageLabels[stage]}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">{stageLeads.length}</span>
                </div>

                {stageLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3"
                  >
                    <Link href={`/dashboard/leads/${lead.id}`} className="block">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-50 hover:underline">
                        {lead.name}
                      </p>
                      {lead.phone && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{lead.phone}</p>
                      )}
                      {lead.property && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">{lead.property.address}</p>
                      )}
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                        {leadSourceLabels[lead.source]}
                      </p>
                    </Link>
                    <div className="mt-2">
                      <LeadStageSelect leadId={lead.id} stage={lead.stage} />
                    </div>
                  </div>
                ))}

                {stageLeads.length === 0 && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 px-1 py-2">Sin leads en esta etapa.</p>
                )}
              </div>
            );
          })}
        </div>

      {perdidos > 0 && (
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Hay {perdidos} {perdidos === 1 ? "lead perdido" : "leads perdidos"} que no se muestran en el tablero.
        </p>
      )}
    </div>
  );
}
