"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CancelarReservaButton({ reservationId }: { reservationId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onClick() {
    if (!confirm("¿Cancelar esta reserva?")) return;
    setLoading(true);
    const res = await fetch(`/api/reservas/${reservationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CANCELADA" }),
    });
    setLoading(false);
    if (res.ok) router.refresh();
  }

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full rounded-lg border border-slate-300 text-sm font-medium py-2 text-slate-600 hover:bg-slate-50 transition disabled:opacity-60"
    >
      {loading ? "Cancelando…" : "Cancelar reserva"}
    </button>
  );
}
