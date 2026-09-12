"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function VisitaForm({
  properties,
  leads,
  defaultPropertyId,
  defaultLeadId,
  redirectTo,
}: {
  properties: { id: string; address: string }[];
  leads?: { id: string; name: string }[];
  defaultPropertyId?: string;
  defaultLeadId?: string;
  redirectTo: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const date = form.get("date");
    const time = form.get("time");
    const payload = {
      propertyId: form.get("propertyId"),
      leadId: form.get("leadId") || defaultLeadId || undefined,
      scheduledAt: `${date}T${time}:00`,
      durationMinutes: form.get("durationMinutes"),
      notes: form.get("notes") || undefined,
    };

    const res = await fetch("/api/visitas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!res.ok) {
      setError("No se pudo agendar la visita. Revisa los datos.");
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Propiedad</label>
          <select
            name="propertyId"
            required
            defaultValue={defaultPropertyId ?? ""}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
          >
            <option value="" disabled>
              Elegir propiedad
            </option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.address}
              </option>
            ))}
          </select>
        </div>

        {leads && !defaultLeadId && (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Lead (opcional)
            </label>
            <select
              name="leadId"
              defaultValue=""
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
            >
              <option value="">Sin lead asociado</option>
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fecha</label>
          <input
            name="date"
            type="date"
            required
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Hora</label>
          <input
            name="time"
            type="time"
            required
            defaultValue="10:00"
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Duración (minutos)
          </label>
          <input
            name="durationMinutes"
            type="number"
            min={15}
            step={15}
            defaultValue={30}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notas</label>
        <textarea
          name="notes"
          rows={2}
          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 border border-red-100 dark:border-red-900 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-medium px-5 py-2.5 hover:bg-slate-800 dark:hover:bg-slate-200 transition disabled:opacity-60"
      >
        {loading ? "Agendando…" : "Agendar visita"}
      </button>
    </form>
  );
}
