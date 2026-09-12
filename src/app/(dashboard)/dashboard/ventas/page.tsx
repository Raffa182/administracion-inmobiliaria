import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatEUR } from "@/lib/format";
import { saleStatusLabels, saleStatusStyles } from "@/lib/labels";

export default async function VentasPage() {
  const session = await auth();
  const tenantId = session!.user.tenantId;

  const sales = await prisma.sale.findMany({
    where: { tenantId },
    include: { property: true, buyer: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Ventas</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Propiedades en venta, comprador y documentación de la operación
          </p>
        </div>
        <Link
          href="/dashboard/ventas/nueva"
          className="rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-medium px-4 py-2 hover:bg-slate-800 dark:hover:bg-slate-200 transition"
        >
          + Nueva venta
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-left text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              <th className="px-5 py-3 font-medium">Propiedad</th>
              <th className="px-5 py-3 font-medium">Comprador</th>
              <th className="px-5 py-3 font-medium">Precio</th>
              <th className="px-5 py-3 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((s) => (
              <tr key={s.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800">
                <td className="px-5 py-4">
                  <Link href={`/dashboard/ventas/${s.id}`} className="block">
                    <p className="font-medium text-slate-900 dark:text-slate-50">{s.property.address}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{s.property.type}</p>
                  </Link>
                </td>
                <td className="px-5 py-4 text-slate-700 dark:text-slate-300">{s.buyer ? s.buyer.name : "—"}</td>
                <td className="px-5 py-4 font-medium text-slate-900 dark:text-slate-50">{formatEUR(s.price)}</td>
                <td className="px-5 py-4">
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${saleStatusStyles[s.status]}`}
                  >
                    {saleStatusLabels[s.status]}
                  </span>
                </td>
              </tr>
            ))}
            {sales.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-slate-400 dark:text-slate-500">
                  Todavía no cargaste ninguna venta.{" "}
                  <Link href="/dashboard/ventas/nueva" className="text-slate-900 dark:text-slate-50 underline">
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
