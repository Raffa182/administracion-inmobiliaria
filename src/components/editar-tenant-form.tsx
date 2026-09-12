"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function EditarTenantForm({
  tenantId,
  name,
  slug,
}: {
  tenantId: string;
  name: string;
  slug: string;
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
    const res = await fetch(`/api/admin/tenants/${tenantId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.get("name"),
        slug: data.get("slug"),
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Nombre</label>
          <input
            name="name"
            defaultValue={name}
            required
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
            Slug (usado para iniciar sesión)
          </label>
          <input
            name="slug"
            defaultValue={slug}
            required
            pattern="[a-z0-9-]+"
            title="Solo minúsculas, números y guiones"
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-medium px-4 py-2 hover:bg-slate-800 dark:hover:bg-slate-200 transition disabled:opacity-60"
      >
        {loading ? "Guardando…" : "Guardar cambios"}
      </button>
      {ok && <span className="ml-3 text-xs text-emerald-600 dark:text-emerald-400">Guardado.</span>}
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </form>
  );
}
