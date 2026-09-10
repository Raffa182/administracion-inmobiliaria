import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatEUR, formatDate } from "@/lib/format";
import { reservationStatusLabels, reservationStatusStyles } from "@/lib/labels";

export default async function ReservasPage() {
  const session = await auth();
  const tenantId = session!.user.tenantId;

  const reservations = await prisma.reservation.findMany({
    where: { tenantId },
    include: { property: true, renter: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Reservas</h1>
          <p className="text-sm text-slate-500 mt-1">
            Paso previo al contrato: seña y datos básicos antes de firmar
          </p>
        </div>
        <Link
          href="/dashboard/reservas/nueva"
          className="rounded-lg bg-slate-900 text-white text-sm font-medium px-4 py-2 hover:bg-slate-800 transition"
        >
          + Nueva reserva
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-5 py-3 font-medium">Propiedad</th>
              <th className="px-5 py-3 font-medium">Inquilino</th>
              <th className="px-5 py-3 font-medium">Fecha</th>
              <th className="px-5 py-3 font-medium">Seña / honorarios</th>
              <th className="px-5 py-3 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((r) => (
              <tr key={r.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="px-5 py-4">
                  <Link href={`/dashboard/reservas/${r.id}`} className="block">
                    <p className="font-medium text-slate-900">{r.property.address}</p>
                  </Link>
                </td>
                <td className="px-5 py-4 text-slate-700">{r.renter.name}</td>
                <td className="px-5 py-4 text-slate-600">{formatDate(r.reservationDate)}</td>
                <td className="px-5 py-4 text-slate-600">{formatEUR(r.amount)}</td>
                <td className="px-5 py-4">
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${reservationStatusStyles[r.status]}`}
                  >
                    {reservationStatusLabels[r.status]}
                  </span>
                </td>
              </tr>
            ))}
            {reservations.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-slate-400">
                  Todavía no cargaste ninguna reserva.{" "}
                  <Link href="/dashboard/reservas/nueva" className="text-slate-900 underline">
                    Crear la primera
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
