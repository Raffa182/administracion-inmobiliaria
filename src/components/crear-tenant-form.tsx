"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CrearTenantForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const data = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/tenants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        inmobiliaria: data.get("inmobiliaria"),
        nombreAdmin: data.get("nombreAdmin"),
        emailAdmin: data.get("emailAdmin"),
        passwordAdmin: data.get("passwordAdmin"),
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? "No se pudo crear la inmobiliaria.");
      return;
    }

    const tenant = await res.json();
    router.push(`/admin/${tenant.id}`);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 max-w-md">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Nombre de la inmobiliaria
        </label>
        <input
          name="inmobiliaria"
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
        />
        <p className="mt-1 text-xs text-slate-400">
          El slug de acceso se genera automáticamente a partir del nombre.
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Nombre del administrador
        </label>
        <input
          name="nombreAdmin"
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Email del administrador
        </label>
        <input
          name="emailAdmin"
          type="email"
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
        <input
          name="passwordAdmin"
          type="password"
          required
          minLength={6}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-slate-900 text-white text-sm font-medium px-4 py-2 hover:bg-slate-800 transition disabled:opacity-60"
      >
        {loading ? "Creando…" : "Crear inmobiliaria"}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </form>
  );
}
