"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CancelarVisitaButton({ visitId }: { visitId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onClick() {
    if (!confirm("¿Cancelar esta visita?")) return;
    setLoading(true);
    await fetch(`/api/visitas/${visitId}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="text-xs text-red-600 dark:text-red-400 hover:underline disabled:opacity-60"
    >
      {loading ? "Cancelando…" : "Cancelar"}
    </button>
  );
}
