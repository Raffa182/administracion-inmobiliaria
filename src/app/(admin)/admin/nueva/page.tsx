import Link from "next/link";
import { CrearTenantForm } from "@/components/crear-tenant-form";

export default function NuevaTenantPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin" className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50">
          ← Volver a inmobiliarias
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 mt-2">Nueva inmobiliaria</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Da de alta una inmobiliaria manualmente, con su primer usuario administrador.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
        <CrearTenantForm />
      </div>
    </div>
  );
}
