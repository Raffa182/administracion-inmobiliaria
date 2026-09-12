import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, formatTime } from "@/lib/format";
import { leadSourceLabels, leadStageLabels } from "@/lib/labels";
import { LeadStageSelect } from "@/components/lead-stage-select";
import { VisitaForm } from "@/components/visita-form";
import { CancelarVisitaButton } from "@/components/cancelar-visita-button";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const tenantId = session!.user.tenantId;

  const [lead, properties] = await Promise.all([
    prisma.lead.findFirst({
      where: { id, tenantId },
      include: { property: true, visits: { orderBy: { scheduledAt: "desc" } } },
    }),
    prisma.property.findMany({
      where: { tenantId },
      select: { id: true, address: true },
      orderBy: { address: "asc" },
    }),
  ]);

  if (!lead) notFound();

  const now = Date.now();
  const proximaVisita = lead.visits.find((v) => v.scheduledAt.getTime() >= now);

  return (
    <div className="space-y-8">
      <div>
        <Link href="/dashboard/leads" className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50">
          ← Volver a leads
        </Link>
        <div className="mt-2 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">{lead.name}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {leadSourceLabels[lead.source]}
              {lead.property && (
                <>
                  {" · "}
                  <Link href={`/dashboard/propiedades/${lead.propertyId}`} className="hover:underline">
                    {lead.property.address}
                  </Link>
                </>
              )}
            </p>
          </div>
          <div className="w-44">
            <LeadStageSelect leadId={lead.id} stage={lead.stage} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Contacto">
            <dl className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
              <Info label="Teléfono" value={lead.phone || "—"} />
              <Info label="Email" value={lead.email || "—"} />
              <Info label="Etapa" value={leadStageLabels[lead.stage]} />
              <Info label="Alta" value={formatDate(lead.createdAt)} />
            </dl>
            {lead.notes && (
              <p className="mt-4 text-sm text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4">
                {lead.notes}
              </p>
            )}
          </Card>

          <Card title="Visitas">
            {lead.visits.length === 0 && (
              <p className="text-sm text-slate-400 dark:text-slate-500">Todavía no hay visitas agendadas.</p>
            )}
            <div className="space-y-3">
              {lead.visits.map((v) => (
                <div
                  key={v.id}
                  className="flex items-center justify-between border border-slate-100 dark:border-slate-800 rounded-lg px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
                      {formatDate(v.scheduledAt)} · {formatTime(v.scheduledAt)}
                    </p>
                    {v.notes && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{v.notes}</p>}
                  </div>
                  {v.scheduledAt.getTime() >= now && <CancelarVisitaButton visitId={v.id} />}
                </div>
              ))}
            </div>
          </Card>

          {!proximaVisita && (
            <Card title="Agendar visita">
              <VisitaForm
                properties={properties}
                defaultPropertyId={lead.propertyId ?? undefined}
                defaultLeadId={lead.id}
                redirectTo={`/dashboard/leads/${lead.id}`}
              />
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card title="Próximo paso">
            {proximaVisita ? (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Visita agendada para el {formatDate(proximaVisita.scheduledAt)} a las{" "}
                {formatTime(proximaVisita.scheduledAt)}.
              </p>
            ) : (
              <p className="text-sm text-slate-400 dark:text-slate-500">Sin visita agendada todavía.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
      <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="mt-0.5 font-medium text-slate-900 dark:text-slate-50">{value}</dd>
    </div>
  );
}
