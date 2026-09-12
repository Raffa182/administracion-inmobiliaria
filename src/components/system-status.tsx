import { prisma } from "@/lib/prisma";
import packageJson from "../../package.json";

function formatUptime(seconds: number) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0 || d > 0) parts.push(`${h}h`);
  parts.push(`${m}m`);
  return parts.join(" ");
}

function formatMB(bytes: number) {
  return `${Math.round(bytes / 1024 / 1024)} MB`;
}

export async function SystemStatus() {
  const dbStart = Date.now();
  let dbOk = true;
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    dbOk = false;
  }
  const dbLatencyMs = Date.now() - dbStart;

  const [tenantTotal, tenantActive, userTotal, superadminTotal] = await Promise.all([
    prisma.tenant.count(),
    prisma.tenant.count({ where: { active: true } }),
    prisma.user.count(),
    prisma.user.count({ where: { role: "SUPERADMIN" } }),
  ]);

  const smtpConfigured = !!process.env.SMTP_HOST;
  const appUrlConfigured = !!process.env.APP_URL;
  const mem = process.memoryUsage();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard
          label="Base de datos"
          value={dbOk ? "Conectada" : "Error"}
          ok={dbOk}
          hint={dbOk ? `Respondió en ${dbLatencyMs} ms` : "No se pudo consultar"}
        />
        <StatusCard
          label="Envío de emails (SMTP)"
          value={smtpConfigured ? "Configurado" : "No configurado"}
          ok={smtpConfigured}
          hint={smtpConfigured ? undefined : "Los links del portal se loguean en consola"}
        />
        <StatusCard
          label="APP_URL"
          value={appUrlConfigured ? "Configurada" : "No configurada"}
          ok={appUrlConfigured}
          hint={appUrlConfigured ? undefined : "Los links de email pueden salir mal armados"}
        />
        <StatusCard label="Proceso" value="Activo" ok={true} hint={`Arriba hace ${formatUptime(process.uptime())}`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-4">Versión y entorno</h2>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <Field label="Versión de la app" value={packageJson.version} />
            <Field label="Node.js" value={process.version} />
            <Field label="Entorno" value={process.env.NODE_ENV ?? "—"} />
            <Field label="Memoria (RSS)" value={formatMB(mem.rss)} />
          </dl>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-4">Plataforma</h2>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <Field label="Inmobiliarias" value={String(tenantTotal)} />
            <Field label="Activas" value={String(tenantActive)} />
            <Field label="Usuarios totales" value={String(userTotal)} />
            <Field label="Super admins" value={String(superadminTotal)} />
          </dl>
        </div>
      </div>

      <p className="text-xs text-slate-400 dark:text-slate-500">
        Para monitoreo externo (uptime checks) hay un endpoint público en{" "}
        <code className="font-mono">/api/health</code>, sin datos sensibles.
      </p>
    </div>
  );
}

function StatusCard({
  label,
  value,
  ok,
  hint,
}: {
  label: string;
  value: string;
  ok: boolean;
  hint?: string;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        <span
          className={`h-2 w-2 rounded-full ${ok ? "bg-emerald-500" : "bg-red-500"}`}
          aria-hidden
        />
      </div>
      <p
        className={`text-lg font-semibold mt-1 ${
          ok ? "text-slate-900 dark:text-slate-50" : "text-red-600 dark:text-red-400"
        }`}
      >
        {value}
      </p>
      {hint && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{hint}</p>}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</dt>
      <dd className="mt-0.5 font-medium text-slate-900 dark:text-slate-50">{value}</dd>
    </div>
  );
}
