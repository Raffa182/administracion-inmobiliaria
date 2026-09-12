import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatEUR, formatDate } from "@/lib/format";
import {
  saleStatusLabels,
  saleStatusStyles,
  personDocumentLabels,
  propertyDocumentLabels,
  expenseLabels,
} from "@/lib/labels";
import { SaleStatusButtons } from "@/components/sale-status-buttons";
import { FileUploadForm } from "@/components/file-upload-form";

export default async function VentaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const tenantId = session!.user.tenantId;

  const sale = await prisma.sale.findFirst({
    where: { id, tenantId },
    include: {
      property: { include: { documents: true, expenses: { orderBy: { date: "desc" } } } },
      buyer: { include: { documents: { orderBy: { createdAt: "desc" } } } },
    },
  });

  if (!sale) notFound();

  return (
    <div className="space-y-8">
      <div>
        <Link href="/dashboard/ventas" className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50">
          ← Volver a ventas
        </Link>
        <div className="mt-2 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
              <Link href={`/dashboard/propiedades/${sale.propertyId}`} className="hover:underline">
                {sale.property.address}
              </Link>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {formatEUR(sale.price)}
              {sale.buyer ? ` · Comprador: ${sale.buyer.name}` : ""}
            </p>
          </div>
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${saleStatusStyles[sale.status]}`}
          >
            {saleStatusLabels[sale.status]}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Documentos de la propiedad">
            <div className="space-y-2">
              {sale.property.documents.length === 0 && (
                <p className="text-sm text-slate-400 dark:text-slate-500">Sin documentos cargados (escritura, etc.).</p>
              )}
              {sale.property.documents.map((doc) => (
                <a
                  key={doc.id}
                  href={doc.fileData}
                  download={doc.fileName}
                  className="flex items-center justify-between rounded-lg border border-slate-100 dark:border-slate-800 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <span className="text-sm text-slate-900 dark:text-slate-50">
                    📄 {propertyDocumentLabels[doc.type]} · {doc.fileName}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">{formatDate(doc.createdAt)}</span>
                </a>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <FileUploadForm
                endpoint={`/api/propiedades/${sale.propertyId}/documentos`}
                typeOptions={[
                  { value: "ESCRITURA", label: "Escritura" },
                  { value: "OTRO", label: "Otro" },
                ]}
              />
            </div>
          </Card>

          <Card title="IBI, basura y otros gastos de la propiedad">
            <div className="space-y-2">
              {sale.property.expenses.length === 0 && (
                <p className="text-sm text-slate-400 dark:text-slate-500">Sin gastos registrados.</p>
              )}
              {sale.property.expenses.map((exp) => (
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
            <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
              Para agregar IBI o basura con recibo adjunto, entrá a la{" "}
              <Link href={`/dashboard/propiedades/${sale.propertyId}`} className="underline">
                ficha de la propiedad
              </Link>
              .
            </p>
          </Card>

          {sale.buyer && (
            <Card title="Documentación del comprador">
              <div className="space-y-2">
                {sale.buyer.documents.length === 0 && (
                  <p className="text-sm text-slate-400 dark:text-slate-500">Sin documentos cargados.</p>
                )}
                {sale.buyer.documents.map((doc) => (
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
                  endpoint={`/api/buyers/${sale.buyer.id}/documentos`}
                  typeOptions={[
                    { value: "DNI", label: "DNI" },
                    { value: "NOMINA", label: "Nómina" },
                    { value: "CONTRATO_TRABAJO", label: "Contrato de trabajo" },
                    { value: "OTRO", label: "Otro" },
                  ]}
                />
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card title="Estado de la venta">
            <SaleStatusButtons saleId={sale.id} status={sale.status} />
            {sale.saleDate && (
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Vendida el {formatDate(sale.saleDate)}</p>
            )}
          </Card>
          {sale.notes && (
            <Card title="Notas">
              <p className="text-sm text-slate-600 dark:text-slate-400">{sale.notes}</p>
            </Card>
          )}
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
