"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const statusOptions: { value: string; label: string }[] = [
  { value: "DISPONIBLE", label: "Disponible" },
  { value: "RESERVADA", label: "Reservada" },
  { value: "VENDIDA", label: "Vendida" },
  { value: "CANCELADA", label: "Cancelada" },
];

export function SaleStatusButtons({ saleId, status }: { saleId: string; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function setStatus(newStatus: string) {
    setLoading(newStatus);
    const res = await fetch(`/api/ventas/${saleId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setLoading(null);
    if (res.ok) router.refresh();
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {statusOptions.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setStatus(opt.value)}
          disabled={loading !== null || status === opt.value}
          className={`rounded-lg border px-3 py-2 text-xs font-medium transition disabled:opacity-50 ${
            status === opt.value
              ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          {loading === opt.value ? "…" : opt.label}
        </button>
      ))}
    </div>
  );
}
