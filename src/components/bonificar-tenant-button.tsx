"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function BonificarTenantButton({
  tenantId,
  bonificado,
}: {
  tenantId: string;
  bonificado: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enviar(body: { bonificado: boolean; motivo?: string }) {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/admin/tenants/${tenantId}/bonificar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setLoading(false);

    if (!res.ok) {
      setError("No se pudo guardar.");
      return;
    }
    setOpen(false);
    router.refresh();
  }

  if (bonificado) {
    return (
      <button
        onClick={() => {
          if (confirm("¿Quitar la bonificación? Volverá a estar sujeta a los límites de su plan.")) {
            enviar({ bonificado: false });
          }
        }}
        disabled={loading}
        className="text-xs font-medium px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900 transition disabled:opacity-60"
      >
        {loading ? "Guardando…" : "Quitar bonificación"}
      </button>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
      >
        Bonificar
      </button>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const motivo = (new FormData(e.currentTarget).get("motivo") as string) || undefined;
        enviar({ bonificado: true, motivo });
      }}
      className="flex items-center gap-2"
    >
      <input
        name="motivo"
        placeholder="Motivo (opcional)"
        autoFocus
        className="rounded-lg border border-slate-300 dark:border-slate-700 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
      />
      <button
        type="submit"
        disabled={loading}
        className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 transition disabled:opacity-60"
      >
        {loading ? "…" : "Confirmar"}
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
      >
        Cancelar
      </button>
      {error && <span className="text-xs text-red-600 dark:text-red-400">{error}</span>}
    </form>
  );
}
