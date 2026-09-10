import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatARS, formatDate, periodLabel, daysUntil } from "@/lib/format";
import { ExpenseForm } from "@/components/expense-form";
import { PaymentRow } from "@/components/payment-row";
import { GeneratePaymentButton } from "@/components/generate-payment-button";

const expenseLabels: Record<string, string> = {
  ABL: "ABL",
  ARREGLO: "Arreglo",
  EXPENSAS: "Expensas",
  SEGURO: "Seguro",
  OTRO: "Otro",
};

export default async function ContratoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const tenantId = session!.user.tenantId;

  const contract = await prisma.contract.findFirst({
    where: { id, tenantId },
    include: {
      property: true,
      renter: true,
      expenses: { orderBy: { date: "desc" } },
      payments: { orderBy: { period: "desc" } },
    },
  });

  if (!contract) notFound();

  const daysToEnd = daysUntil(contract.endDate);
  const daysToAdjust = contract.nextAdjustmentDate ? daysUntil(contract.nextAdjustmentDate) : null;
  const currentPeriodStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
  const hasCurrentPeriodPayment = contract.payments.some((p) => p.period === currentPeriodStr);

  return (
    <div className="space-y-8">
      <div>
        <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-900">
          ← Volver a alquileres
        </Link>
        <div className="mt-2 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{contract.property.address}</h1>
            <p className="text-sm text-slate-500 mt-1">
              {contract.property.type} · Inquilino: {contract.renter.name}
              {contract.renter.dni ? ` (DNI ${contract.renter.dni})` : ""}
            </p>
          </div>
          <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 border-emerald-200">
            {contract.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Datos del contrato">
            <dl className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
              <Info label="Fecha de inicio" value={formatDate(contract.startDate)} />
              <Info
                label="Fecha de fin"
                value={formatDate(contract.endDate)}
                hint={
                  daysToEnd <= 60
                    ? daysToEnd < 0
                      ? `Vencido hace ${Math.abs(daysToEnd)} días`
                      : `Vence en ${daysToEnd} días`
                    : undefined
                }
                warn={daysToEnd <= 60}
              />
              <Info label="Monto del alquiler" value={formatARS(contract.rentAmount)} />
              <Info
                label="Próxima actualización"
                value={contract.nextAdjustmentDate ? formatDate(contract.nextAdjustmentDate) : "—"}
                hint={
                  daysToAdjust !== null && daysToAdjust <= 30
                    ? daysToAdjust < 0
                      ? "Actualización pendiente"
                      : `En ${daysToAdjust} días`
                    : undefined
                }
                warn={daysToAdjust !== null && daysToAdjust <= 30}
              />
              <Info
                label="Frecuencia de actualización"
                value={`Cada ${contract.adjustmentFrequencyMonths} meses`}
              />
            </dl>
          </Card>

          <Card title="Contrato digitalizado">
            {contract.contractFileData ? (
              <a
                href={contract.contractFileData}
                download={contract.contractFileName ?? "contrato.pdf"}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                📄 {contract.contractFileName ?? "Ver contrato"}
              </a>
            ) : (
              <p className="text-sm text-slate-400">No se subió el contrato digitalizado todavía.</p>
            )}
          </Card>

          <Card title="ABL y arreglos">
            <div className="space-y-3">
              {contract.expenses.length === 0 && (
                <p className="text-sm text-slate-400">Sin gastos registrados.</p>
              )}
              {contract.expenses.map((exp) => (
                <div
                  key={exp.id}
                  className="flex items-center justify-between border border-slate-100 rounded-lg px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {expenseLabels[exp.type]} · {exp.description}
                    </p>
                    <p className="text-xs text-slate-500">{formatDate(exp.date)}</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{formatARS(exp.amount)}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <ExpenseForm contractId={contract.id} />
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Pagos">
            <div className="space-y-3">
              {contract.payments.length === 0 && (
                <p className="text-sm text-slate-400">Todavía no hay pagos generados.</p>
              )}
              {contract.payments.map((p) => (
                <PaymentRow
                  key={p.id}
                  id={p.id}
                  periodLabel={periodLabel(p.period)}
                  amount={p.amount}
                  status={p.status}
                  paidDate={p.paidDate ? formatDate(p.paidDate) : null}
                  hasReceipt={!!p.receiptFileData}
                />
              ))}
            </div>
            {!hasCurrentPeriodPayment && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <GeneratePaymentButton contractId={contract.id} />
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <h2 className="text-sm font-semibold text-slate-900 mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Info({
  label,
  value,
  hint,
  warn,
}: {
  label: string;
  value: string;
  hint?: string;
  warn?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-0.5 font-medium text-slate-900">{value}</dd>
      {hint && (
        <dd className={`text-xs mt-0.5 ${warn ? "text-amber-600" : "text-slate-400"}`}>{hint}</dd>
      )}
    </div>
  );
}
