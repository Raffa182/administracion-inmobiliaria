import Link from "next/link";
import { CrearTenantForm } from "@/components/crear-tenant-form";

export default function NuevaTenantPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin" className="text-sm text-slate-500 hover:text-slate-900">
          ← Volver a inmobiliarias
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900 mt-2">Nueva inmobiliaria</h1>
        <p className="text-sm text-slate-500 mt-1">
          Da de alta una inmobiliaria manualmente, con su primer usuario administrador.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <CrearTenantForm />
      </div>
    </div>
  );
}
