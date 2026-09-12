import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { ToggleTenantActiveButton } from "@/components/toggle-tenant-active-button";

export default async function AdminPage() {
  const tenants = await prisma.tenant.findMany({
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Inmobiliarias</h1>
        <p className="text-sm text-slate-500 mt-1">
          Todas las cuentas dadas de alta en la plataforma.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100">
        {tenants.map((tenant) => (
          <div key={tenant.id} className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              {tenant.logoFileData ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={tenant.logoFileData}
                  alt={tenant.name}
                  className="h-9 w-9 rounded-lg object-cover border border-slate-200"
                />
              ) : (
                <div className="h-9 w-9 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 font-semibold text-xs">
                  {tenant.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {tenant.name}
                  {!tenant.active && (
                    <span className="ml-2 inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
                      Inactiva
                    </span>
                  )}
                </p>
                <p className="text-xs text-slate-500">
                  {tenant.slug} · alta {formatDate(tenant.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="hidden sm:flex items-center gap-4 text-xs text-slate-500">
                <span>{tenant._count.users} usuarios</span>
                <span>{tenant._count.properties} propiedades</span>
                <span>{tenant._count.contracts} contratos</span>
                <span>{tenant._count.sales} ventas</span>
              </div>
              <ToggleTenantActiveButton tenantId={tenant.id} active={tenant.active} />
            </div>
          </div>
        ))}
        {tenants.length === 0 && (
          <p className="text-sm text-slate-400 px-5 py-4">No hay inmobiliarias dadas de alta.</p>
        )}
      </div>
    </div>
  );
}
