"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { planLabels, planOrder } from "@/lib/planes";

export function EditarPlanForm({
  tenantId,
  plan,
  maxUsuarios,
  maxPropiedades,
  bonificado,
}: {
  tenantId: string;
  plan: string;
  maxUsuarios: number | null;
  maxPropiedades: number | null;
  bonificado: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setOk(false);
    setLoading(true);

    const data = new FormData(e.currentTarget);
    const rawUsuarios = data.get("maxUsuarios") as string;
    const rawPropiedades = data.get("maxPropiedades") as string;

    const res = await fetch(`/api/admin/tenants/${tenantId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plan: data.get("plan"),
        maxUsuarios: rawUsuarios === "" ? null : Number(rawUsuarios),
        maxPropiedades: rawPropiedades === "" ? null : Number(rawPropiedades),
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? "No se pudo guardar.");
      return;
    }

    setOk(true);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {bonificado && (
        <p className="text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
          Esta inmobiliaria está bonificada: no se le aplican los límites de abajo mientras dure la bonificación.
        </p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Plan</label>
          <select
            name="plan"
            defaultValue={plan}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
          >
            {planOrder.map((p) => (
              <option key={p} value={p}>
                {planLabels[p]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
            Máx. usuarios
          </label>
          <input
            name="maxUsuarios"
            type="number"
            min={1}
            defaultValue={maxUsuarios ?? ""}
            placeholder="Sin límite"
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
            Máx. propiedades
          </label>
          <input
            name="maxPropiedades"
            type="number"
            min={1}
            defaultValue={maxPropiedades ?? ""}
            placeholder="Sin límite"
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-medium px-4 py-2 hover:bg-slate-800 dark:hover:bg-slate-200 transition disabled:opacity-60"
      >
        {loading ? "Guardando…" : "Guardar plan"}
      </button>
      {ok && <span className="ml-3 text-xs text-emerald-600 dark:text-emerald-400">Guardado.</span>}
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </form>
  );
}
