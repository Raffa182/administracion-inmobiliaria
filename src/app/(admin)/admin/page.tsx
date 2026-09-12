import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { planLabels } from "@/lib/planes";
import { AdminSearchBox } from "@/components/admin-search-box";
import { SystemStatus } from "@/components/system-status";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const tenants = await prisma.tenant.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { slug: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          users: true,
          properties: true,
          contracts: true,
          sales: true,
        },
      },
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Estado del sistema</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Salud del servidor y de la plataforma en este momento.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/seguridad"
              className="shrink-0 rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Seguridad
            </Link>
            <Link
              href="/admin/auditoria"
              className="shrink-0 rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Auditoría
            </Link>
          </div>
        </div>
        <SystemStatus />
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Inmobiliarias</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Todas las cuentas dadas de alta en la plataforma.
          </p>
        </div>
        <Link
          href="/admin/nueva"
          className="shrink-0 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-3 py-2 text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-200"
        >
          Nueva inmobiliaria
        </Link>
      </div>

      <AdminSearchBox />

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl divide-y divide-slate-100 dark:divide-slate-800">
        {tenants.map((tenant) => (
          <Link
            key={tenant.id}
            href={`/admin/${tenant.id}`}
            className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <div className="flex items-center gap-3">
              {tenant.logoFileData ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={tenant.logoFileData}
                  alt={tenant.name}
                  className="h-9 w-9 rounded-lg object-cover border border-slate-200 dark:border-slate-800"
                />
              ) : (
                <div className="h-9 w-9 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold text-xs">
                  {tenant.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
                  {tenant.name}
                  {!tenant.active && (
                    <span className="ml-2 inline-flex items-center rounded-full border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 px-2 py-0.5 text-xs font-medium text-red-700 dark:text-red-300">
                      Inactiva
                    </span>
                  )}
                  {tenant.bonificado && (
                    <span className="ml-2 inline-flex items-center rounded-full border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300">
                      Bonificada
                    </span>
                  )}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {tenant.slug} · plan {planLabels[tenant.plan]} · alta {formatDate(tenant.createdAt)}
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <span>{tenant._count.users} usuarios</span>
              <span>{tenant._count.properties} propiedades</span>
              <span>{tenant._count.contracts} contratos</span>
              <span>{tenant._count.sales} ventas</span>
            </div>
          </Link>
        ))}
        {tenants.length === 0 && (
          <p className="text-sm text-slate-400 dark:text-slate-500 px-5 py-4">
            No hay inmobiliarias que coincidan con la búsqueda.
          </p>
        )}
      </div>
    </div>
  );
}
