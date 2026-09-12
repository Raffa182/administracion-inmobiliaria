import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { EditarTenantForm } from "@/components/editar-tenant-form";
import { BorrarTenantButton } from "@/components/borrar-tenant-button";
import { ResetPasswordForm } from "@/components/reset-password-form";
import { EditarEmailForm } from "@/components/editar-email-form";
import { ImpersonarButton } from "@/components/impersonar-button";
import { ToggleTenantActiveButton } from "@/components/toggle-tenant-active-button";

const roleLabels: Record<string, string> = {
  ADMIN: "Administrador",
  AGENTE: "Agente",
  SUPERADMIN: "Super admin",
};

export default async function AdminTenantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const tenant = await prisma.tenant.findUnique({
    where: { id },
    include: {
      users: { orderBy: { createdAt: "asc" } },
      _count: {
        select: { properties: true, contracts: true, sales: true, reservations: true },
      },
    },
  });
  if (!tenant) notFound();

  const hasAdmin = tenant.users.some((u) => u.role === "ADMIN");

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin" className="text-sm text-slate-500 hover:text-slate-900">
          ← Volver a inmobiliarias
        </Link>
        <div className="mt-2 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              {tenant.name}
              {!tenant.active && (
                <span className="ml-2 inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
                  Inactiva
                </span>
              )}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {tenant.slug} · alta {formatDate(tenant.createdAt)}
            </p>
          </div>
          <ToggleTenantActiveButton tenantId={tenant.id} active={tenant.active} />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Propiedades" value={tenant._count.properties} />
        <StatCard label="Contratos" value={tenant._count.contracts} />
        <StatCard label="Reservas" value={tenant._count.reservations} />
        <StatCard label="Ventas" value={tenant._count.sales} />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">Datos de la inmobiliaria</h2>
        <EditarTenantForm tenantId={tenant.id} name={tenant.name} slug={tenant.slug} />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">Usuarios</h2>
        <div className="space-y-2">
          {tenant.users.map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium text-slate-900">{u.name}</p>
                <p className="text-xs text-slate-500">
                  {u.email} · {roleLabels[u.role] ?? u.role} · alta {formatDate(u.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <EditarEmailForm userId={u.id} email={u.email} />
                <ResetPasswordForm userId={u.id} />
              </div>
            </div>
          ))}
          {tenant.users.length === 0 && (
            <p className="text-sm text-slate-400">Sin usuarios.</p>
          )}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">Soporte</h2>
        {hasAdmin ? (
          <ImpersonarButton tenantId={tenant.id} disabled={!tenant.active} />
        ) : (
          <p className="text-sm text-slate-400">
            No tiene un usuario ADMIN para entrar en su nombre.
          </p>
        )}
      </div>

      <div className="bg-white border border-red-100 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-red-700 mb-2">Zona de riesgo</h2>
        <p className="text-xs text-slate-500 mb-3">
          Borra la inmobiliaria y todos sus datos (propiedades, contratos, ventas, documentos,
          usuarios). No se puede deshacer.
        </p>
        <BorrarTenantButton tenantId={tenant.id} slug={tenant.slug} />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <p className="text-2xl font-semibold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
  );
}
