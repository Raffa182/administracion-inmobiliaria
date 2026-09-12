import Link from "next/link";
import { auth } from "@/lib/auth";
import { getAlerts, countAlerts } from "@/lib/alerts";
import { formatEUR, formatDate, daysUntil } from "@/lib/format";

export default async function NotificacionesPage() {
  const session = await auth();
  const tenantId = session!.user.tenantId;
  const alerts = await getAlerts(tenantId);
  const total = countAlerts(alerts);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Notificaciones</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {total === 0
            ? "No hay nada que requiera tu atención hoy."
            : `${total} cosa${total === 1 ? "" : "s"} para revisar.`}
        </p>
      </div>

      <AlertSection title="Pagos vencidos" emptyText="No hay pagos vencidos.">
        {alerts.overduePayments.map((p) => (
          <AlertRow
            key={p.id}
            href={`/dashboard/contratos/${p.contractId}`}
            title={p.contract.property.address}
            subtitle={`${p.contract.renter.name} · cuota ${p.period}`}
            detail={`Vencido hace ${Math.abs(daysUntil(p.dueDate))} días · ${formatEUR(p.amount)}`}
            accent="red"
          />
        ))}
      </AlertSection>

      <AlertSection title="Pagos próximos (14 días)" emptyText="No hay pagos próximos a vencer.">
        {alerts.upcomingPayments.map((p) => (
          <AlertRow
            key={p.id}
            href={`/dashboard/contratos/${p.contractId}`}
            title={p.contract.property.address}
            subtitle={`${p.contract.renter.name} · cuota ${p.period}`}
            detail={`Vence el ${formatDate(p.dueDate)} · ${formatEUR(p.amount)}`}
            accent="amber"
          />
        ))}
      </AlertSection>

      <AlertSection title="Contratos por vencer (60 días)" emptyText="No hay contratos por vencer.">
        {alerts.expiringContracts.map((c) => {
          const days = daysUntil(c.endDate);
          return (
            <AlertRow
              key={c.id}
              href={`/dashboard/contratos/${c.id}`}
              title={c.property.address}
              subtitle={c.renter.name}
              detail={
                days < 0
                  ? `Vencido hace ${Math.abs(days)} días`
                  : `Vence en ${days} días (${formatDate(c.endDate)})`
              }
              accent={days < 0 ? "red" : "amber"}
            />
          );
        })}
      </AlertSection>

      <AlertSection
        title="Reservas sin resolver (+15 días)"
        emptyText="No hay reservas estancadas."
      >
        {alerts.staleReservations.map((r) => (
          <AlertRow
            key={r.id}
            href={`/dashboard/reservas/${r.id}`}
            title={r.property.address}
            subtitle={r.renter.name}
            detail={`Reservada el ${formatDate(r.reservationDate)}, sigue activa`}
            accent="amber"
          />
        ))}
      </AlertSection>
    </div>
  );
}

function AlertSection({
  title,
  emptyText,
  children,
}: {
  title: string;
  emptyText: string;
  children: React.ReactNode;
}) {
  const items = Array.isArray(children) ? children : [children];
  const hasItems = items.some(Boolean);
  return (
    <section>
      <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-3">{title}</h2>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl divide-y divide-slate-100 dark:divide-slate-800">
        {hasItems ? children : <p className="px-5 py-4 text-sm text-slate-400 dark:text-slate-500">{emptyText}</p>}
      </div>
    </section>
  );
}

function AlertRow({
  href,
  title,
  subtitle,
  detail,
  accent,
}: {
  href: string;
  title: string;
  subtitle: string;
  detail: string;
  accent: "red" | "amber";
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800"
    >
      <div>
        <p className="font-medium text-slate-900 dark:text-slate-50">{title}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
      </div>
      <p
        className={`text-sm font-medium text-right shrink-0 ${
          accent === "red" ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"
        }`}
      >
        {detail}
      </p>
    </Link>
  );
}
