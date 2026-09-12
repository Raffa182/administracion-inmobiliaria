import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAlerts, countAlerts } from "@/lib/alerts";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { VolverAAdminButton } from "@/components/volver-a-admin-button";
import { ThemeToggle } from "@/components/theme-toggle";

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "U";
}

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

      <div className="flex-1 flex min-h-0">
        <DashboardSidebar
          tenantName={session?.user?.tenantName ?? "Gestión Inmobiliaria"}
          tenantLogo={tenant?.logoFileData ?? null}
          userEmail={session?.user?.email ?? ""}
          userInitials={initialsOf(session?.user?.name || session?.user?.email || "U")}
          isAdmin={isAdmin}
        />

        <div className="flex-1 min-w-0 flex flex-col">
          <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 sm:px-8 py-3 flex items-center justify-end gap-4">
            <Link
              href="/dashboard/notificaciones"
              className="relative text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50"
              aria-label="Notificaciones"
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M18 8a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M13.7 21a2 2 0 0 1-3.4 0" />
              </svg>
              {alertCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                  {alertCount > 9 ? "9+" : alertCount}
                </span>
              )}
            </Link>
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
