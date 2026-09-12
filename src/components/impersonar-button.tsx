"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ImpersonarButton({ tenantId, disabled }: { tenantId: string; disabled?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/admin/tenants/${tenantId}/impersonar`, { method: "POST" });

    if (!res.ok) {
      setLoading(false);
      const body = await res.json().catch(() => null);
      setError(body?.error ?? "No se pudo entrar como esta inmobiliaria.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div>
      <button
        onClick={onClick}
        disabled={disabled || loading}
        className="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
        title={disabled ? "Reactivá la inmobiliaria primero" : undefined}
      >
        {loading ? "Entrando…" : "Entrar como esta inmobiliaria"}
      </button>
      {error && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>}
    </div>
  );
}
