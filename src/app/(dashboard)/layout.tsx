import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAlerts, countAlerts } from "@/lib/alerts";
import { SignOutButton } from "@/components/sign-out-button";
import { VolverAAdminButton } from "@/components/volver-a-admin-button";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (session?.user?.role === "SUPERADMIN") {
    redirect("/admin");
  }

  const tenant = session?.user?.tenantId
    ? await prisma.tenant.findUnique({
        where: { id: session.user.tenantId },
        select: { logoFileData: true },
      })
    : null;
  const isAdmin = session?.user?.role === "ADMIN";
  const alertCount = session?.user?.tenantId
    ? countAlerts(await getAlerts(session.user.tenantId))
    : 0;

  return (
    <div className="min-h-screen flex flex-col">
      {session?.user?.impersonating && (
        <div className="bg-amber-500 text-white text-sm px-4 py-2 flex items-center justify-between gap-3">
          <span>
            Estás viendo como <b>{session.user.tenantName}</b> (modo soporte, entraste desde
            Super Admin).
          </span>
          <VolverAAdminButton />
        </div>
      )}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {tenant?.logoFileData ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={tenant.logoFileData}
                alt={session?.user?.tenantName ?? "Logo"}
                className="h-9 w-9 rounded-lg object-cover border border-slate-200 dark:border-slate-800"
              />
            ) : (
              <div className="h-9 w-9 flex items-center justify-center rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold text-sm">
                GI
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-50 leading-tight">
                {session?.user?.tenantName ?? "Gestión Inmobiliaria"}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight">
                {session?.user?.email}
              </p>
            </div>
          </div>

          <nav className="hidden sm:flex items-center gap-1">
            <Link
              href="/dashboard/resumen"
              className="px-3 py-1.5 text-sm font-medium rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Resumen
            </Link>
            <Link
              href="/dashboard"
              className="px-3 py-1.5 text-sm font-medium rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Alquileres
            </Link>
            <Link
              href="/dashboard/reservas"
              className="px-3 py-1.5 text-sm font-medium rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Reservas
            </Link>
            <Link
              href="/dashboard/ventas"
              className="px-3 py-1.5 text-sm font-medium rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Ventas
            </Link>
            <Link
              href="/dashboard/propiedades"
              className="px-3 py-1.5 text-sm font-medium rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Propiedades
            </Link>
            <Link
              href="/dashboard/notificaciones"
              className="relative px-3 py-1.5 text-sm font-medium rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Notificaciones
              {alertCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                  {alertCount > 9 ? "9+" : alertCount}
                </span>
              )}
            </Link>
            {isAdmin && (
              <Link
                href="/dashboard/equipo"
                className="px-3 py-1.5 text-sm font-medium rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Equipo
              </Link>
            )}
            {isAdmin && (
              <Link
                href="/dashboard/configuracion"
                className="px-3 py-1.5 text-sm font-medium rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Configuración
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  );
}
