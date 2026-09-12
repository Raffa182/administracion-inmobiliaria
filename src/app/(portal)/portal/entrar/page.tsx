"use client";

import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function PortalEntrarPage() {
  const [tenantSlug, setTenantSlug] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/portal/solicitar-acceso", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantSlug, email }),
    });
    setLoading(false);
    setSent(true);
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold text-lg">
            GI
          </div>
          <h1 className="mt-4 text-xl font-semibold text-slate-900 dark:text-slate-50">
            Portal de inquilinos
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Consultá tu contrato y tus pagos sin llamar a la inmobiliaria
          </p>
        </div>

        {sent ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 text-center space-y-2">
            <p className="text-sm text-slate-700 dark:text-slate-300">
              Si el email coincide con un inquilino o comprador de esa inmobiliaria, te
              enviamos un link de acceso.
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Revisá también la carpeta de spam.
            </p>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Inmobiliaria (slug)
              </label>
              <input
                required
                value={tenantSlug}
                onChange={(e) => setTenantSlug(e.target.value)}
                placeholder="mi-inmobiliaria"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Email
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="el email que le diste a la inmobiliaria"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-medium py-2 hover:bg-slate-800 dark:hover:bg-slate-200 transition disabled:opacity-60"
            >
              {loading ? "Enviando…" : "Enviarme el link de acceso"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
