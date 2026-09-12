"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function EliminarUsuarioButton({ userId }: { userId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    if (!confirm("¿Eliminar este usuario?")) return;
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/usuarios/${userId}`, { method: "DELETE" });

    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? "No se pudo eliminar.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={onClick}
        disabled={loading}
        className="text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-400 disabled:opacity-60"
      >
        {loading ? "Eliminando…" : "Eliminar"}
      </button>
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
