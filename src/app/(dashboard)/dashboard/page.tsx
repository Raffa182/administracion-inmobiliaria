import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatEUR, formatDate, daysUntil } from "@/lib/format";

const statusStyles: Record<string, string> = {
  ACTIVO: "bg-emerald-50 text-emerald-700 border-emerald-200",
  FINALIZADO: "bg-slate-100 text-slate-600 border-slate-200",
  RESCINDIDO: "bg-red-50 text-red-700 border-red-200",
};

export default async function DashboardPage() {
  const session = await auth();
  const tenantId = session!.user.tenantId;

  const contracts = await prisma.contract.findMany({
    where: { tenantId },
    include: {
      property: true,
      renter: true,
      payments: {
        orderBy: { period: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const activos = contracts.filter((c) => c.status === "ACTIVO").length;
  const porVencer = contracts.filter(
    (c) => c.status === "ACTIVO" && daysUntil(c.endDate) <= 60 && daysUntil(c.endDate) >= 0
  ).length;
  const pagosPendientes = contracts.filter(
    (c) => c.payments[0]?.status === "PENDIENTE" || c.payments[0]?.status === "VENCIDO"
  ).length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Alquileres</h1>
          <p className="text-sm text-slate-500 mt-1">
            Contratos, vencimientos y estado de pago de tu cartera
          </p>
        </div>
        <Link
          href="/dashboard/contratos/nuevo"
          className="rounded-lg bg-slate-900 text-white text-sm font-medium px-4 py-2 hover:bg-slate-800 transition"
        >
          + Nuevo contrato
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Contratos activos" value={activos} />
        <StatCard label="Por vencer (60 días)" value={porVencer} accent="amber" />
        <StatCard label="Pagos pendientes" value={pagosPendientes} accent="red" />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-5 py-3 font-medium">Propiedad</th>
              <th className="px-5 py-3 font-medium">Inquilino</th>
              <th className="px-5 py-3 font-medium">Contrato</th>
              <th className="px-5 py-3 font-medium">Próx. actualización</th>
              <th className="px-5 py-3 font-medium">Alquiler</th>
              <th className="px-5 py-3 font-medium">Último pago</th>
              <th className="px-5 py-3 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {contracts.map((c) => {
              const lastPayment = c.payments[0];
              const daysToEnd = daysUntil(c.endDate);
              return (
                <tr
                  key={c.id}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50 cursor-pointer"
                >
                  <td className="px-5 py-4">
                    <Link href={`/dashboard/contratos/${c.id}`} className="block">
                      <p className="font-medium text-slate-900">{c.property.address}</p>
                      <p className="text-xs text-slate-500">{c.property.type}</p>
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-slate-700">{c.renter.name}</td>
                  <td className="px-5 py-4 text-slate-600">
                    <p>{formatDate(c.startDate)} → {formatDate(c.endDate)}</p>
                    {c.status === "ACTIVO" && daysToEnd <= 60 && (
                      <p className={`text-xs mt-0.5 ${daysToEnd < 0 ? "text-red-600" : "text-amber-600"}`}>
                        {daysToEnd < 0
                          ? `Vencido hace ${Math.abs(daysToEnd)} días`
                          : `Vence en ${daysToEnd} días`}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {c.nextAdjustmentDate ? formatDate(c.nextAdjustmentDate) : "—"}
                  </td>
                  <td className="px-5 py-4 font-medium text-slate-900">
                    {formatEUR(c.rentAmount)}
                  </td>
                  <td className="px-5 py-4">
                    {lastPayment ? (
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
                          lastPayment.status === "PAGADO"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {lastPayment.status === "PAGADO" ? "Pagado" : "Pendiente"} ·{" "}
                        {lastPayment.period}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">Sin pagos</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusStyles[c.status]}`}
                    >
                      {c.status}
                    </span>
                  </td>
                </tr>
              );
            })}
            {contracts.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-slate-400">
                  Todavía no cargaste ningún contrato.{" "}
                  <Link href="/dashboard/contratos/nuevo" className="text-slate-900 underline">
                    Crear el primero
                  </Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: "amber" | "red";
}) {
  const color =
    accent === "amber"
      ? "text-amber-600"
      : accent === "red"
      ? "text-red-600"
      : "text-slate-900";
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`text-3xl font-semibold mt-1 ${color}`}>{value}</p>
    </div>
  );
}
