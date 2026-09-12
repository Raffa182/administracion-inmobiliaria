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
          ? "border-red-200 text-red-600 hover:bg-red-50"
          : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
      }`}
    >
      {loading ? "Guardando…" : active ? "Desactivar" : "Reactivar"}
    </button>
  );
}
