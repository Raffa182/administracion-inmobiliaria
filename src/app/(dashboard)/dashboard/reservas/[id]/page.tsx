import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatEUR, formatDate } from "@/lib/format";
import { reservationStatusLabels, reservationStatusStyles } from "@/lib/labels";
import { ConvertirReservaForm } from "@/components/convertir-reserva-form";
import { CancelarReservaButton } from "@/components/cancelar-reserva-button";

export default async function ReservaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const tenantId = session!.user.tenantId;

  const reservation = await prisma.reservation.findFirst({
    where: { id, tenantId },
    include: { property: true, renter: true, contract: true },
  });

  if (!reservation) notFound();

  return (
    <div className="space-y-8">
      <div>
        <Link href="/dashboard/reservas" className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50">
          ← Volver a reservas
        </Link>
        <div className="mt-2 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
              <Link href={`/dashboard/propiedades/${reservation.propertyId}`} className="hover:underline">
                {reservation.property.address}
              </Link>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Inquilino: {reservation.renter.name}</p>
          </div>
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${reservationStatusStyles[reservation.status]}`}
          >
            {reservationStatusLabels[reservation.status]}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Datos de la reserva">
            <dl className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
              <Info label="Fecha" value={formatDate(reservation.reservationDate)} />
              <Info label="Seña / honorarios" value={formatEUR(reservation.amount)} />
            </dl>
            {reservation.notes && (
              <p className="mt-4 text-sm text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4">
                {reservation.notes}
              </p>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Acciones">
            {reservation.status === "ACTIVA" && (
              <div className="space-y-3">
                <ConvertirReservaForm reservationId={reservation.id} />
                <CancelarReservaButton reservationId={reservation.id} />
              </div>
            )}
            {reservation.status === "CONVERTIDA" && reservation.contractId && (
              <Link
                href={`/dashboard/contratos/${reservation.contractId}`}
                className="block w-full text-center rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-medium py-2.5 hover:bg-slate-800 dark:hover:bg-slate-200 transition"
              >
                Ver contrato
              </Link>
            )}
            {reservation.status === "CANCELADA" && (
              <p className="text-sm text-slate-400 dark:text-slate-500">Esta reserva fue cancelada.</p>
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
