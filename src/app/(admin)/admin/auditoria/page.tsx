import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";

const actionLabels: Record<string, string> = {
  ACTIVAR_TENANT: "Activó",
  REACTIVAR_TENANT: "Reactivó",
  DESACTIVAR_TENANT: "Desactivó",
  EDITAR_TENANT: "Editó",
  EDITAR_EMAIL_USUARIO: "Editó el email de",
  BORRAR_TENANT: "Borró",
  CREAR_TENANT: "Creó",
  RESETEAR_PASSWORD: "Reseteó contraseña de",
  IMPERSONAR_INICIO: "Entró como",
  IMPERSONAR_FIN: "Volvió de",
};

export default async function AuditoriaPage() {
  const logs = await prisma.adminAuditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin" className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50">
          ← Volver a inmobiliarias
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 mt-2">Auditoría</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Últimas {logs.length} acciones de super admins sobre las inmobiliarias.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl divide-y divide-slate-100 dark:divide-slate-800">
        {logs.map((log) => (
          <div key={log.id} className="px-5 py-3 text-sm">
            <p className="text-slate-900 dark:text-slate-50">
              <span className="font-medium">{log.actorEmail}</span>{" "}
              {actionLabels[log.action] ?? log.action}{" "}
              {log.targetTenantName ? (
                <span className="font-medium">
                  {log.targetTenantName} ({log.targetTenantSlug})
                </span>
              ) : null}
              {log.targetUserEmail ? <> · {log.targetUserEmail}</> : null}
            </p>
            {log.details && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{log.details}</p>}
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{formatDate(log.createdAt)}</p>
          </div>
        ))}
        {logs.length === 0 && (
          <p className="text-sm text-slate-400 dark:text-slate-500 px-5 py-4">Todavía no hay acciones registradas.</p>
        )}
      </div>
    </div>
  );
}
