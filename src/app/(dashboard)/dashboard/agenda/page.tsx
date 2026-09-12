import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, formatTime } from "@/lib/format";
import { startOfWeek, addDays, toDateParam, isSameDay } from "@/lib/week";
import { CancelarVisitaButton } from "@/components/cancelar-visita-button";

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ semana?: string }>;
}) {
  const { semana } = await searchParams;
  const session = await auth();
  const tenantId = session!.user.tenantId;

  const base = semana ? new Date(`${semana}T00:00:00`) : new Date();
  const weekStart = startOfWeek(base);
  const weekEnd = addDays(weekStart, 7);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const visits = await prisma.visit.findMany({
    where: { tenantId, scheduledAt: { gte: weekStart, lt: weekEnd } },
    include: { property: true, lead: true },
    orderBy: { scheduledAt: "asc" },
  });

  const now = Date.now();
  const dayLabel = new Intl.DateTimeFormat("es-ES", { weekday: "short", day: "numeric" });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Agenda de visitas</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {formatDate(weekStart)} – {formatDate(addDays(weekStart, 6))}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/agenda?semana=${toDateParam(addDays(weekStart, -7))}`}
            className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            ‹ Semana anterior
          </Link>
          <Link
            href={`/dashboard/agenda?semana=${toDateParam(addDays(weekStart, 7))}`}
            className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Semana siguiente ›
          </Link>
          <Link
            href="/dashboard/agenda/nueva"
            className="rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-medium px-4 py-2 hover:bg-slate-800 dark:hover:bg-slate-200 transition"
          >
            + Nueva visita
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
        {days.map((day) => {
          const dayVisits = visits.filter((v) => isSameDay(v.scheduledAt, day));
          const isToday = isSameDay(day, new Date());
          return (
            <div key={day.toISOString()} className="space-y-2">
              <p
                className={`text-xs font-semibold uppercase tracking-wide px-1 ${
                  isToday ? "text-slate-900 dark:text-slate-50" : "text-slate-500 dark:text-slate-400"
                }`}
              >
                {dayLabel.format(day)}
              </p>
              <div className="space-y-2">
                {dayVisits.map((v) => (
                  <div
                    key={v.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3"
                  >
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-50">
                      {formatTime(v.scheduledAt)}
                    </p>
                    <Link
                      href={`/dashboard/propiedades/${v.propertyId}`}
                      className="block text-xs text-slate-700 dark:text-slate-300 mt-1 hover:underline"
                    >
                      {v.property.address}
                    </Link>
                    {v.lead && (
                      <Link
                        href={`/dashboard/leads/${v.leadId}`}
                        className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5 hover:underline"
                      >
                        {v.lead.name}
                      </Link>
                    )}
                    {v.scheduledAt.getTime() >= now && (
                      <div className="mt-2">
                        <CancelarVisitaButton visitId={v.id} />
                      </div>
                    )}
                  </div>
                ))}
                {dayVisits.length === 0 && (
                  <p className="text-xs text-slate-300 dark:text-slate-600 px-1">Sin visitas</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
