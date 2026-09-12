"use client";

import { useState } from "react";

export function ResetPasswordForm({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const data = new FormData(e.currentTarget);
    const res = await fetch(`/api/admin/usuarios/${userId}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: data.get("password") }),
    });

    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? "No se pudo cambiar la contraseña.");
      return;
    }

    setOk(true);
    (e.currentTarget as HTMLFormElement).reset();
    setTimeout(() => setOpen(false), 1500);
  }

  if (!open) {
    return (
      <button
        onClick={() => {
          setOpen(true);
          setOk(false);
          setError(null);
        }}
        className="text-xs font-medium text-slate-600 hover:text-slate-900"
      >
        Resetear contraseña
      </button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex items-center gap-2">
      <input
        name="password"
        type="password"
        placeholder="Nueva contraseña"
        required
        minLength={6}
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
      {ok && <span className="text-xs text-emerald-600">Listo</span>}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </form>
  );
}
