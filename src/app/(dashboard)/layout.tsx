import Link from "next/link";
import { auth } from "@/lib/auth";
import { SignOutButton } from "@/components/sign-out-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 flex items-center justify-center rounded-lg bg-slate-900 text-white font-semibold text-sm">
              GI
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 leading-tight">
                {session?.user?.tenantName ?? "Gestión Inmobiliaria"}
              </p>
              <p className="text-xs text-slate-500 leading-tight">
                {session?.user?.email}
              </p>
            </div>
          </div>

          <nav className="hidden sm:flex items-center gap-1">
            <Link
              href="/dashboard"
              className="px-3 py-1.5 text-sm font-medium rounded-lg text-slate-600 hover:bg-slate-100"
            >
              Alquileres
            </Link>
            <Link
              href="/dashboard/reservas"
              className="px-3 py-1.5 text-sm font-medium rounded-lg text-slate-600 hover:bg-slate-100"
            >
              Reservas
            </Link>
            <Link
              href="/dashboard/ventas"
              className="px-3 py-1.5 text-sm font-medium rounded-lg text-slate-600 hover:bg-slate-100"
            >
              Ventas
            </Link>
            <Link
              href="/dashboard/propiedades"
              className="px-3 py-1.5 text-sm font-medium rounded-lg text-slate-600 hover:bg-slate-100"
            >
              Propiedades
            </Link>
          </nav>

          <SignOutButton />
        </div>
      </header>
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  );
}
