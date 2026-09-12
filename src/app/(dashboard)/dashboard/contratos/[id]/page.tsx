import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatEUR, formatDate, periodLabel, daysUntil } from "@/lib/format";
import { expenseLabels, contractTypeLabels, personDocumentLabels } from "@/lib/labels";
import { ExpenseForm } from "@/components/expense-form";
import { PaymentRow } from "@/components/payment-row";
import { GeneratePaymentButton } from "@/components/generate-payment-button";
import { FileUploadForm } from "@/components/file-upload-form";

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
      renter: { include: { documents: { orderBy: { createdAt: "desc" } } } },
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
        <Link href="/dashboard" className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50">
          ← Volver a alquileres
        </Link>
        <div className="mt-2 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
              <Link href={`/dashboard/propiedades/${contract.propertyId}`} className="hover:underline">
                {contract.property.address}
              </Link>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {contract.property.type} · Inquilino: {contract.renter.name}
              {contract.renter.dni ? ` (DNI ${contract.renter.dni})` : ""}
              {" · "}
              {contractTypeLabels[contract.contractType]}
            </p>
          </div>
          <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">
            {contract.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Datos del contrato">
            <dl className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
              <Info label="Tipo de contrato" value={contractTypeLabels[contract.contractType]} />
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
              <Info label="Monto del alquiler" value={formatEUR(contract.rentAmount)} />
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
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                📄 {contract.contractFileName ?? "Ver contrato"}
              </a>
            ) : (
              <p className="text-sm text-slate-400 dark:text-slate-500">No se subió el contrato digitalizado todavía.</p>
            )}
          </Card>

          <Card title="Documentación del inquilino">
            <div className="space-y-2">
              {contract.renter.documents.length === 0 && (
                <p className="text-sm text-slate-400 dark:text-slate-500">Sin documentos cargados.</p>
              )}
              {contract.renter.documents.map((doc) => (
                <a
                  key={doc.id}
                  href={doc.fileData}
                  download={doc.fileName}
                  className="flex items-center justify-between rounded-lg border border-slate-100 dark:border-slate-800 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <span className="text-sm text-slate-900 dark:text-slate-50">
                    📄 {personDocumentLabels[doc.type]} · {doc.fileName}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">{formatDate(doc.createdAt)}</span>
                </a>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <FileUploadForm
                endpoint={`/api/renters/${contract.renterId}/documentos`}
                typeOptions={[
                  { value: "DNI", label: "DNI" },
                  { value: "NOMINA", label: "Nómina" },
                  { value: "CONTRATO_TRABAJO", label: "Contrato de trabajo" },
                  { value: "OTRO", label: "Otro" },
                ]}
              />
            </div>
          </Card>

          <Card title="IBI y arreglos">
            <div className="space-y-3">
              {contract.expenses.length === 0 && (
                <p className="text-sm text-slate-400 dark:text-slate-500">Sin gastos registrados.</p>
              )}
              {contract.expenses.map((exp) => (
                <div
                  key={exp.id}
                  className="flex items-center justify-between border border-slate-100 dark:border-slate-800 rounded-lg px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
                      {expenseLabels[exp.type]} · {exp.description}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(exp.date)}</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{formatEUR(exp.amount)}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <ExpenseForm endpoint={`/api/contratos/${contract.id}/gastos`} />
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Pagos">
            <div className="space-y-3">
              {contract.payments.length === 0 && (
                <p className="text-sm text-slate-400 dark:text-slate-500">Todavía no hay pagos generados.</p>
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
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
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
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
      <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-4">{title}</h2>
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
      <dt className="text-xs text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="mt-0.5 font-medium text-slate-900 dark:text-slate-50">{value}</dd>
      {hint && (
        <dd className={`text-xs mt-0.5 ${warn ? "text-amber-600 dark:text-amber-400" : "text-slate-400 dark:text-slate-500"}`}>{hint}</dd>
      )}
    </div>
  );
}
