"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function EditarEmailForm({ userId, email }: { userId: string; email: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const data = new FormData(e.currentTarget);
    const res = await fetch(`/api/admin/usuarios/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: data.get("email") }),
    });

    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? "No se pudo cambiar el email.");
      return;
    }

    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => {
          setOpen(true);
          setError(null);
        }}
        className="text-xs font-medium text-slate-600 hover:text-slate-900"
      >
        Editar email
      </button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex items-center gap-2">
      <input
        name="email"
        type="email"
        defaultValue={email}
        required
        autoFocus
        className="rounded-lg border border-slate-300 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
      />
      <button
        type="submit"
        disabled={loading}
        className="text-xs font-medium text-slate-900 hover:underline disabled:opacity-60"
      >
        {loading ? "…" : "Guardar"}
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="text-xs text-slate-400 hover:text-slate-600"
      >
        Cancelar
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </form>
  );
}
