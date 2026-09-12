import { redirect } from "next/navigation";
import { getPortalSession } from "@/lib/portal-session";
import { prisma } from "@/lib/prisma";
import { formatEUR, formatDate } from "@/lib/format";
import { saleStatusLabels, saleStatusStyles } from "@/lib/labels";
import { PortalSignOutButton } from "@/components/portal-sign-out-button";

const paymentStatusStyles: Record<string, string> = {
  PAGADO: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PENDIENTE: "bg-amber-50 text-amber-700 border-amber-200",
  VENCIDO: "bg-red-50 text-red-700 border-red-200",
};
const paymentStatusLabels: Record<string, string> = {
  PAGADO: "Pagado",
  PENDIENTE: "Pendiente",
  VENCIDO: "Vencido",
};

export default async function PortalPage() {
  const session = await getPortalSession();
  if (!session) redirect("/portal/entrar");

  const contracts =
    session.personType === "RENTER"
      ? await prisma.contract.findMany({
          where: { tenantId: session.tenantId, renterId: session.personId },
          include: { property: true, payments: { orderBy: { period: "desc" } } },
          orderBy: { createdAt: "desc" },
        })
      : [];

  const sales =
    session.personType === "BUYER"
      ? await prisma.sale.findMany({
          where: { tenantId: session.tenantId, buyerId: session.personId },
          include: { property: true },
          orderBy: { createdAt: "desc" },
        })
      : [];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900 leading-tight">
              {session.tenantName}
            </p>
            <p className="text-xs text-slate-500 leading-tight">{session.name}</p>
          </div>
          <PortalSignOutButton />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-8 space-y-6">
        {contracts.map((c) => (
          <section
            key={c.id}
            className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4"
          >
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{c.property.address}</h2>
              <p className="text-sm text-slate-500">
                {formatDate(c.startDate)} → {formatDate(c.endDate)} · {formatEUR(c.rentAmount)}/mes
              </p>
            </div>
            <div className="divide-y divide-slate-100 border-t border-slate-100">
              {c.payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{p.period}</p>
                    <p className="text-xs text-slate-500">Vence {formatDate(p.dueDate)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-900">
                      {formatEUR(p.amount)}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${paymentStatusStyles[p.status]}`}
                    >
                      {paymentStatusLabels[p.status]}
                    </span>
                  </div>
                </div>
              ))}
              {c.payments.length === 0 && (
                <p className="py-3 text-sm text-slate-400">Todavía no hay pagos cargados.</p>
              )}
            </div>
          </section>
        ))}

        {sales.map((s) => (
          <section key={s.id} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2">
            <h2 className="text-lg font-semibold text-slate-900">{s.property.address}</h2>
            <p className="text-sm text-slate-500">{formatEUR(s.price)}</p>
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${saleStatusStyles[s.status]}`}
            >
              {saleStatusLabels[s.status]}
            </span>
          </section>
        ))}

        {contracts.length === 0 && sales.length === 0 && (
          <p className="text-center text-sm text-slate-400 py-12">
            No encontramos contratos ni operaciones asociadas a tu cuenta todavía.
          </p>
        )}
      </main>
    </div>
  );
}
