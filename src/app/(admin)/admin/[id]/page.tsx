import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { planLabels } from "@/lib/planes";
import { EditarTenantForm } from "@/components/editar-tenant-form";
import { BorrarTenantButton } from "@/components/borrar-tenant-button";
import { ResetPasswordForm } from "@/components/reset-password-form";
import { EditarEmailForm } from "@/components/editar-email-form";
import { ImpersonarButton } from "@/components/impersonar-button";
import { ToggleTenantActiveButton } from "@/components/toggle-tenant-active-button";
import { BonificarTenantButton } from "@/components/bonificar-tenant-button";
import { EditarPlanForm } from "@/components/editar-plan-form";

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
        <Link href="/admin" className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50">
          ← Volver a inmobiliarias
        </Link>
        <div className="mt-2 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
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
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {tenant.slug} · plan {planLabels[tenant.plan]} · alta {formatDate(tenant.createdAt)}
            </p>
            {tenant.bonificado && tenant.bonificadoMotivo && (
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                Motivo: {tenant.bonificadoMotivo}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <BonificarTenantButton tenantId={tenant.id} bonificado={tenant.bonificado} />
            <ToggleTenantActiveButton tenantId={tenant.id} active={tenant.active} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Propiedades" value={tenant._count.properties} />
        <StatCard label="Contratos" value={tenant._count.contracts} />
        <StatCard label="Reservas" value={tenant._count.reservations} />
        <StatCard label="Ventas" value={tenant._count.sales} />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-4">Datos de la inmobiliaria</h2>
        <EditarTenantForm tenantId={tenant.id} name={tenant.name} slug={tenant.slug} />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-1">Plan y límites de uso</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          {tenant.users.length} de {tenant.maxUsuarios ?? "∞"} usuarios · {tenant._count.properties} de{" "}
          {tenant.maxPropiedades ?? "∞"} propiedades
        </p>
        <EditarPlanForm
          tenantId={tenant.id}
          plan={tenant.plan}
          maxUsuarios={tenant.maxUsuarios}
          maxPropiedades={tenant.maxPropiedades}
          bonificado={tenant.bonificado}
        />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-4">Usuarios</h2>
        <div className="space-y-2">
          {tenant.users.map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between rounded-lg border border-slate-100 dark:border-slate-800 px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-50">{u.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
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
            <p className="text-sm text-slate-400 dark:text-slate-500">Sin usuarios.</p>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-4">Soporte</h2>
        {hasAdmin ? (
          <ImpersonarButton tenantId={tenant.id} disabled={!tenant.active} />
        ) : (
          <p className="text-sm text-slate-400 dark:text-slate-500">
            No tiene un usuario ADMIN para entrar en su nombre.
          </p>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-red-100 dark:border-red-900 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-red-700 dark:text-red-300 mb-2">Zona de riesgo</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
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
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
      <p className="text-2xl font-semibold text-slate-900 dark:text-slate-50">{value}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{label}</p>
    </div>
  );
}
