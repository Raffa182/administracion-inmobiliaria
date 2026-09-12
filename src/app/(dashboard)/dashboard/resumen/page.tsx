import Link from "next/link";
import { subMonths } from "date-fns";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAlerts, countAlerts } from "@/lib/alerts";
import { formatEUR, periodLabel } from "@/lib/format";
import { IngresosChart } from "@/components/ingresos-chart";

function periodOf(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export default async function ResumenPage() {
  const session = await auth();
  const tenantId = session!.user.tenantId;
  const now = new Date();

  const meses = Array.from({ length: 6 }, (_, i) => periodOf(subMonths(now, 5 - i)));
  const currentPeriod = meses[meses.length - 1];

  const [cobros, propiedadesAlquiler, pagosPendientes, alerts] = await Promise.all([
    prisma.payment.groupBy({
      by: ["period"],
      where: { tenantId, status: "PAGADO", period: { in: meses } },
      _sum: { amount: true },
    }),
    prisma.property.findMany({
      where: { tenantId, listingType: { in: ["ALQUILER", "ALQUILER_Y_VENTA"] } },
      include: { contracts: { where: { status: "ACTIVO" }, take: 1 } },
    }),
    prisma.payment.count({
      where: { tenantId, status: { in: ["PENDIENTE", "VENCIDO"] } },
    }),
    getAlerts(tenantId),
  ]);

  const cobrosPorPeriodo = new Map(cobros.map((c) => [c.period, c._sum.amount ?? 0]));
  const chartData = meses.map((m) => ({
    label: periodLabel(m).split(" ")[0],
    amount: cobrosPorPeriodo.get(m) ?? 0,
    current: m === currentPeriod,
  }));
  const ingresosEsteMes = cobrosPorPeriodo.get(currentPeriod) ?? 0;

  const ocupadas = propiedadesAlquiler.filter((p) => p.contracts.length > 0).length;
  const ocupacion =
    propiedadesAlquiler.length > 0
      ? Math.round((ocupadas / propiedadesAlquiler.length) * 100)
      : null;

  const totalAlertas = countAlerts(alerts);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Resumen</h1>
        <p className="text-sm text-slate-500 mt-1">Cómo viene el negocio este mes</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Cobrado este mes" value={formatEUR(ingresosEsteMes)} />
        <StatCard
          label="Ocupación"
          value={ocupacion === null ? "—" : `${ocupacion}%`}
          hint={
            propiedadesAlquiler.length > 0
              ? `${ocupadas} de ${propiedadesAlquiler.length} en alquiler`
              : "Sin propiedades en alquiler"
          }
        />
        <StatCard
          label="Pagos pendientes"
          value={pagosPendientes}
          accent={pagosPendientes > 0 ? "amber" : undefined}
        />
        <Link href="/dashboard/notificaciones" className="block">
          <StatCard
            label="Necesita atención"
            value={totalAlertas}
            accent={totalAlertas > 0 ? "red" : undefined}
            hint="Ver notificaciones"
          />
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">Cobrado por mes</h2>
        <IngresosChart data={chartData} />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string | number;
  hint?: string;
  accent?: "amber" | "red";
}) {
  const color =
    accent === "amber" ? "text-amber-600" : accent === "red" ? "text-red-600" : "text-slate-900";
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 h-full">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`text-3xl font-semibold mt-1 ${color}`}>{value}</p>
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}
