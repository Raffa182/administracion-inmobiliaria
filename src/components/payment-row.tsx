"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatEUR } from "@/lib/format";

export function PaymentRow({
  id,
  periodLabel,
  amount,
  status,
  paidDate,
  hasReceipt,
}: {
  id: string;
  periodLabel: string;
  amount: number;
  status: string;
  paidDate: string | null;
  hasReceipt: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function marcarPagado() {
    setLoading(true);
    const res = await fetch(`/api/pagos/${id}/pagar`, { method: "POST" });
    setLoading(false);
    if (res.ok) router.refresh();
  }

  return (
    <div className="flex items-center justify-between border border-slate-100 rounded-lg px-3 py-2.5">
      <div>
        <p className="text-sm font-medium text-slate-900 capitalize">{periodLabel}</p>
        <p className="text-xs text-slate-500">
          {formatEUR(amount)}
          {paidDate ? ` · pagado el ${paidDate}` : ""}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {status === "PAGADO" ? (
          <>
            <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700 border-emerald-200">
              Pagado
            </span>
            {hasReceipt && (
              <a
                href={`/api/pagos/${id}/recibo`}
                className="text-xs font-medium text-slate-600 hover:text-slate-900 underline"
              >
                Recibo
              </a>
            )}
          </>
        ) : (
          <button
            onClick={marcarPagado}
            disabled={loading}
            className="rounded-lg bg-slate-900 text-white text-xs font-medium px-3 py-1.5 hover:bg-slate-800 transition disabled:opacity-60"
          >
            {loading ? "Generando…" : "Marcar pagado"}
          </button>
        )}
      </div>
    </div>
  );
}
