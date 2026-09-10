"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ExpenseForm({ endpoint }: { endpoint: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: form.get("type"),
        description: form.get("description"),
        amount: form.get("amount"),
        date: form.get("date"),
      }),
    });

    setLoading(false);

    if (!res.ok) {
      setError("No se pudo registrar el gasto.");
      return;
    }

    e.currentTarget.reset();
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <select
          name="type"
          required
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
        >
          <option value="IBI">IBI</option>
          <option value="BASURA">Basura</option>
          <option value="ARREGLO">Arreglo</option>
          <option value="COMUNIDAD">Comunidad</option>
          <option value="SEGURO">Seguro</option>
          <option value="OTRO">Otro</option>
        </select>
        <input
          name="date"
          type="date"
          required
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
        />
      </div>
      <input
        name="description"
        placeholder="Descripción (ej: IBI anual)"
        required
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
      />
      <div className="flex gap-3">
        <input
          name="amount"
          type="number"
          min={0}
          step="0.01"
          placeholder="Monto"
          required
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-slate-900 text-white text-sm font-medium px-4 py-2 hover:bg-slate-800 transition disabled:opacity-60"
        >
          {loading ? "Agregando…" : "Agregar"}
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </form>
  );
}
