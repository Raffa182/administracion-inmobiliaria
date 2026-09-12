"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function BorrarTenantButton({ tenantId, slug }: { tenantId: string; slug: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    const typed = window.prompt(
      `Esto borra TODOS los datos de "${slug}" (propiedades, contratos, ventas, usuarios, documentos). No se puede deshacer.\n\nEscribí "${slug}" para confirmar:`
    );
    if (typed !== slug) return;

    setLoading(true);
    setError(null);
    const res = await fetch(`/api/admin/tenants/${tenantId}`, { method: "DELETE" });
    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? "No se pudo borrar.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div>
      <button
        onClick={onClick}
        disabled={loading}
        className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-60"
      >
        {loading ? "Borrando…" : "Borrar inmobiliaria"}
      </button>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
