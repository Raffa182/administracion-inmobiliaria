import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { UsuarioForm } from "@/components/usuario-form";
import { EliminarUsuarioButton } from "@/components/eliminar-usuario-button";

const roleLabels: Record<string, string> = {
  ADMIN: "Administrador",
  AGENTE: "Agente",
  SUPERADMIN: "Super admin",
};

export default async function EquipoPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const users = await prisma.user.findMany({
    where: { tenantId: session.user.tenantId },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Equipo</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Gestiona quiénes pueden acceder a {session.user.tenantName}.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-4">Usuarios</h2>
        <div className="space-y-2">
          {users.map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between rounded-lg border border-slate-100 dark:border-slate-800 px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
                  {u.name}
                  {u.id === session.user.id && (
                    <span className="ml-2 text-xs text-slate-400 dark:text-slate-500">(tú)</span>
                  )}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {u.email} · {roleLabels[u.role] ?? u.role} · alta {formatDate(u.createdAt)}
                </p>
              </div>
              {u.id !== session.user.id && <EliminarUsuarioButton userId={u.id} />}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-4">Agregar usuario</h2>
        <UsuarioForm />
      </div>
    </div>
  );
}
