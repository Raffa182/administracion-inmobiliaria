"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ToggleTenantActiveButton({
  tenantId,
  active,
}: {
  tenantId: string;
  active: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onClick() {
    const confirmMsg = active
      ? "¿Desactivar esta inmobiliaria? Sus usuarios no podrán iniciar sesión."
      : "¿Reactivar esta inmobiliaria?";
    if (!confirm(confirmMsg)) return;

    setLoading(true);
    const res = await fetch(`/api/admin/tenants/${tenantId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    setLoading(false);

    if (res.ok) router.refresh();
  }

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition disabled:opacity-60 ${
        active
          ? "border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900"
          : "border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900"
      }`}
    >
      {loading ? "Guardando…" : active ? "Desactivar" : "Reactivar"}
    </button>
  );
}
