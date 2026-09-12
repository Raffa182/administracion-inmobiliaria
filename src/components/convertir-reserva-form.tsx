"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ConvertirReservaForm({ reservationId }: { reservationId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const payload = {
      contractType: form.get("contractType"),
      startDate: form.get("startDate"),
      endDate: form.get("endDate"),
      rentAmount: form.get("rentAmount"),
      adjustmentFrequencyMonths: form.get("adjustmentFrequencyMonths"),
    };

    const res = await fetch(`/api/reservas/${reservationId}/convertir`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!res.ok) {
      setError("No se pudo convertir la reserva en contrato.");
      return;
    }

    const { id } = await res.json();
    router.push(`/dashboard/contratos/${id}`);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-medium py-2.5 hover:bg-slate-800 dark:hover:bg-slate-200 transition"
      >
        Convertir en contrato
      </button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tipo de contrato</label>
        <select
          name="contractType"
          defaultValue="LARGA_TEMPORADA"
          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
        >
          <option value="LARGA_TEMPORADA">Larga temporada</option>
          <option value="TEMPORADA">Temporada</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Inicio</label>
          <input
            name="startDate"
            type="date"
            required
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fin</label>
          <input
            name="endDate"
            type="date"
            required
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Alquiler (€)</label>
          <input
            name="rentAmount"
            type="number"
            min={0}
            required
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Actualiza cada (meses)</label>
          <input
            name="adjustmentFrequencyMonths"
            type="number"
            min={1}
            defaultValue={12}
            required
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
          />
        </div>
      </div>
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-medium py-2.5 hover:bg-slate-800 dark:hover:bg-slate-200 transition disabled:opacity-60"
      >
        {loading ? "Creando contrato…" : "Confirmar y crear contrato"}
      </button>
    </form>
  );
}
