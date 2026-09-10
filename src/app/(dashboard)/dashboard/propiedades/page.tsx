import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatEUR } from "@/lib/format";
import { listingTypeLabels } from "@/lib/labels";

export default async function PropiedadesPage() {
  const session = await auth();
  const tenantId = session!.user.tenantId;

  const properties = await prisma.property.findMany({
    where: { tenantId },
    include: {
      _count: { select: { contracts: true, sales: true, photos: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Propiedades</h1>
          <p className="text-sm text-slate-500 mt-1">
            Ficha de cada inmueble: características, fotos y documentación
          </p>
        </div>
        <Link
          href="/dashboard/propiedades/nueva"
          className="rounded-lg bg-slate-900 text-white text-sm font-medium px-4 py-2 hover:bg-slate-800 transition"
        >
          + Nueva propiedad
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-5 py-3 font-medium">Propiedad</th>
              <th className="px-5 py-3 font-medium">Ciudad</th>
              <th className="px-5 py-3 font-medium">m² / hab.</th>
              <th className="px-5 py-3 font-medium">Se ofrece en</th>
              <th className="px-5 py-3 font-medium">Precio orientativo</th>
            </tr>
          </thead>
          <tbody>
            {properties.map((p) => (
              <tr
                key={p.id}
                className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
              >
                <td className="px-5 py-4">
                  <Link href={`/dashboard/propiedades/${p.id}`} className="block">
                    <p className="font-medium text-slate-900">
                      {p.address}
                      {p.unit ? `, ${p.unit}` : ""}
                    </p>
                    <p className="text-xs text-slate-500">
                      {p.type}
                      {p.inUrbanizacion && p.complexName ? ` · Urb. ${p.complexName}` : ""}
                    </p>
                  </Link>
                </td>
                <td className="px-5 py-4 text-slate-600">{p.city ?? "—"}</td>
                <td className="px-5 py-4 text-slate-600">
                  {p.squareMeters ? `${p.squareMeters} m²` : "—"}
                  {p.rooms !== null ? ` · ${p.rooms} hab.` : ""}
                </td>
                <td className="px-5 py-4 text-slate-600">{listingTypeLabels[p.listingType]}</td>
                <td className="px-5 py-4 text-slate-600">
                  {p.askingRent ? `${formatEUR(p.askingRent)}/mes` : ""}
                  {p.askingRent && p.askingSale ? " · " : ""}
                  {p.askingSale ? formatEUR(p.askingSale) : ""}
                  {!p.askingRent && !p.askingSale && "—"}
                </td>
              </tr>
            ))}
            {properties.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-slate-400">
                  Todavía no cargaste ninguna propiedad.{" "}
                  <Link href="/dashboard/propiedades/nueva" className="text-slate-900 underline">
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
