"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { leadSourceLabels } from "@/lib/labels";

export function LeadForm({ properties }: { properties: { id: string; address: string }[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const payload = {
      name: form.get("name"),
      phone: form.get("phone") || undefined,
      email: form.get("email") || undefined,
      propertyId: form.get("propertyId") || undefined,
      source: form.get("source"),
      notes: form.get("notes") || undefined,
    };

    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!res.ok) {
      setError("No se pudo crear el lead. Revisa los datos.");
      return;
    }

    router.push("/dashboard/leads");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Nombre y apellido
            </label>
            <input
              name="name"
              required
              placeholder="Laura Martín"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Teléfono</label>
            <input
              name="phone"
              placeholder="+34 611 222 333"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
            <input
              name="email"
              type="email"
              placeholder="laura@mail.com"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Origen</label>
            <select
              name="source"
              defaultValue="OTRO"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
            >
              {Object.entries(leadSourceLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Propiedad de interés (opcional)
            </label>
            <select
              name="propertyId"
              defaultValue=""
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
            >
              <option value="">Sin propiedad asociada</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.address}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notas</label>
          <textarea
            name="notes"
            rows={3}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 border border-red-100 dark:border-red-900 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-medium px-5 py-2.5 hover:bg-slate-800 dark:hover:bg-slate-200 transition disabled:opacity-60"
        >
          {loading ? "Guardando…" : "Crear lead"}
        </button>
      </div>
    </form>
  );
}
