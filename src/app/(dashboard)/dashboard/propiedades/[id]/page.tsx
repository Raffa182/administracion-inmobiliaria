import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatEUR, formatDate } from "@/lib/format";
import {
  listingTypeLabels,
  expenseLabels,
  propertyDocumentLabels,
  saleStatusLabels,
  saleStatusStyles,
  contractStatusStyles,
} from "@/lib/labels";
import { FileUploadForm } from "@/components/file-upload-form";
import { ExpenseForm } from "@/components/expense-form";

export default async function PropiedadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const tenantId = session!.user.tenantId;

  const property = await prisma.property.findFirst({
    where: { id, tenantId },
    include: {
      owner: true,
      photos: { orderBy: { createdAt: "desc" } },
      documents: { orderBy: { createdAt: "desc" } },
      expenses: { orderBy: { date: "desc" } },
      contracts: {
        include: { renter: true },
        orderBy: { createdAt: "desc" },
      },
      sales: {
        include: { buyer: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!property) notFound();

  const propertyPhotos = property.photos.filter((p) => p.type === "PROPIEDAD");
  const keyPhotos = property.photos.filter((p) => p.type === "LLAVE");

  return (
    <div className="space-y-8">
      <div>
        <Link href="/dashboard/propiedades" className="text-sm text-slate-500 hover:text-slate-900">
          ← Volver a propiedades
        </Link>
        <div className="mt-2 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              {property.address}
              {property.unit ? `, ${property.unit}` : ""}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {property.type} · {property.city ?? "Sin ciudad"}
              {property.inUrbanizacion && property.complexName ? ` · Urb. ${property.complexName}` : ""}
            </p>
          </div>
          <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium bg-slate-100 text-slate-700 border-slate-200">
            {listingTypeLabels[property.listingType]}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Ficha">
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 text-sm">
              <Info label="Metros cuadrados" value={property.squareMeters ? `${property.squareMeters} m²` : "—"} />
              <Info label="Habitaciones" value={property.rooms !== null ? String(property.rooms) : "—"} />
              <Info label="Mascotas" value={boolLabel(property.petsAllowed)} />
              <Info label="Electrodomésticos" value={boolLabel(property.appliancesIncluded)} />
              <Info label="Amueblado" value={boolLabel(property.furnished)} />
              <Info label="Parking" value={boolLabel(property.hasParking)} />
              <Info
                label="Precio alquiler orientativo"
                value={property.askingRent ? `${formatEUR(property.askingRent)}/mes` : "—"}
              />
              <Info
                label="Precio venta orientativo"
                value={property.askingSale ? formatEUR(property.askingSale) : "—"}
              />
              <Info
                label="Propietario"
                value={property.owner ? property.owner.name : "—"}
              />
            </dl>
            {property.notes && (
              <p className="mt-4 text-sm text-slate-600 border-t border-slate-100 pt-4">
                {property.notes}
              </p>
            )}
          </Card>

          <Card title="Fotos de la propiedad">
            <PhotoGrid photos={propertyPhotos} />
            <div className="mt-4 pt-4 border-t border-slate-100">
              <FileUploadForm
                endpoint={`/api/propiedades/${property.id}/fotos`}
                typeOptions={[{ value: "PROPIEDAD", label: "Foto de la propiedad" }]}
                accept="image/*"
                submitLabel="Subir foto"
              />
            </div>
          </Card>

          <Card title="Fotos de llaves">
            <p className="text-xs text-slate-500 mb-3">
              Para identificar a qué propiedad corresponde cada llave si se pierde la etiqueta.
            </p>
            <PhotoGrid photos={keyPhotos} showLabel />
            <div className="mt-4 pt-4 border-t border-slate-100">
              <FileUploadForm
                endpoint={`/api/propiedades/${property.id}/fotos`}
                typeOptions={[{ value: "LLAVE", label: "Foto de llave" }]}
                accept="image/*"
                showLabelField
                labelPlaceholder="Ej: Llave puerta principal"
                submitLabel="Subir foto de llave"
              />
            </div>
          </Card>

          <Card title="Documentos de la propiedad">
            <div className="space-y-2">
              {property.documents.length === 0 && (
                <p className="text-sm text-slate-400">Sin documentos cargados.</p>
              )}
              {property.documents.map((doc) => (
                <a
                  key={doc.id}
                  href={doc.fileData}
                  download={doc.fileName}
                  className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 hover:bg-slate-50"
                >
                  <span className="text-sm text-slate-900">
                    📄 {propertyDocumentLabels[doc.type]} · {doc.fileName}
                  </span>
                  <span className="text-xs text-slate-400">{formatDate(doc.createdAt)}</span>
                </a>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <FileUploadForm
                endpoint={`/api/propiedades/${property.id}/documentos`}
                typeOptions={[
                  { value: "ESCRITURA", label: "Escritura" },
                  { value: "OTRO", label: "Otro" },
                ]}
              />
            </div>
          </Card>

          <Card title="IBI, basura y otros gastos">
            <div className="space-y-2">
              {property.expenses.length === 0 && (
                <p className="text-sm text-slate-400">Sin gastos registrados.</p>
              )}
              {property.expenses.map((exp) => (
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
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-semibold text-slate-900">{formatEUR(exp.amount)}</p>
                    {exp.receiptFileData && (
                      <a
                        href={exp.receiptFileData}
                        download={exp.receiptFileName ?? "recibo"}
                        className="text-xs font-medium text-slate-600 hover:text-slate-900 underline"
                      >
                        Recibo
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <ExpenseForm endpoint={`/api/propiedades/${property.id}/gastos`} />
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Contratos de alquiler">
            <div className="space-y-2">
              {property.contracts.length === 0 && (
                <p className="text-sm text-slate-400">Sin contratos.</p>
              )}
              {property.contracts.map((c) => (
                <Link
                  key={c.id}
                  href={`/dashboard/contratos/${c.id}`}
                  className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 hover:bg-slate-50"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">{c.renter.name}</p>
                    <p className="text-xs text-slate-500">
                      {formatDate(c.startDate)} → {formatDate(c.endDate)}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${contractStatusStyles[c.status]}`}
                  >
                    {c.status}
                  </span>
                </Link>
              ))}
            </div>
          </Card>

          <Card title="Ventas">
            <div className="space-y-2">
              {property.sales.length === 0 && (
                <p className="text-sm text-slate-400">Sin ventas.</p>
              )}
              {property.sales.map((s) => (
                <Link
                  key={s.id}
                  href={`/dashboard/ventas/${s.id}`}
                  className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 hover:bg-slate-50"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {s.buyer ? s.buyer.name : "Sin comprador"}
                    </p>
                    <p className="text-xs text-slate-500">{formatEUR(s.price)}</p>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${saleStatusStyles[s.status]}`}
                  >
                    {saleStatusLabels[s.status]}
                  </span>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function boolLabel(value: boolean | null) {
  if (value === null || value === undefined) return "—";
  return value ? "Sí" : "No";
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <h2 className="text-sm font-semibold text-slate-900 mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-0.5 font-medium text-slate-900">{value}</dd>
    </div>
  );
}

function PhotoGrid({
  photos,
  showLabel,
}: {
  photos: { id: string; fileName: string; fileData: string; label: string | null }[];
  showLabel?: boolean;
}) {
  if (photos.length === 0) {
    return <p className="text-sm text-slate-400">Sin fotos todavía.</p>;
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {photos.map((photo) => (
        <a key={photo.id} href={photo.fileData} download={photo.fileName} className="block">
          {/* Fotos guardadas como data URL en la base; next/image no las optimiza. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.fileData}
            alt={photo.label ?? photo.fileName}
            className="w-full aspect-square object-cover rounded-lg border border-slate-200"
          />
          {showLabel && photo.label && (
            <p className="mt-1 text-xs text-slate-500 truncate">{photo.label}</p>
          )}
        </a>
      ))}
    </div>
  );
}
