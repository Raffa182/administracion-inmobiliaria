"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function GeneratePaymentButton({ contractId }: { contractId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onClick() {
    setLoading(true);
    const res = await fetch(`/api/contratos/${contractId}/pagos`, { method: "POST" });
    setLoading(false);
    if (res.ok) router.refresh();
  }

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full rounded-lg border border-slate-300 text-sm font-medium py-2 text-slate-700 hover:bg-slate-50 transition disabled:opacity-60"
    >
      {loading ? "Generando…" : "Generar pago del mes actual"}
    </button>
  );
}
