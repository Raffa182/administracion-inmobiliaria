"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LoginPage() {
  const router = useRouter();
  const [tenantSlug, setTenantSlug] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [needsOtp, setNeedsOtp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", {
      tenantSlug,
      email,
      password,
      otp,
      redirect: false,
    });
    setLoading(false);
    if (res?.code === "2FA_REQUIRED") {
      setNeedsOtp(true);
      return;
    }
    if (res?.code === "2FA_INVALIDO") {
      setError("Código incorrecto. Probá de nuevo.");
      return;
    }
    if (res?.error) {
      setError("Datos incorrectos. Revisa la inmobiliaria, el email y la contraseña.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  function volver() {
    setNeedsOtp(false);
    setOtp("");
    setError(null);
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
            {needsOtp ? "Verificación en dos pasos" : "Ingresar a tu inmobiliaria"}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {needsOtp
              ? "Ingresá el código de tu app de autenticación o un código de respaldo"
              : "Accede con el email de tu cuenta"}
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 space-y-4"
        >
          {!needsOtp && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Inmobiliaria (slug)
                </label>
                <input
                  required
                  value={tenantSlug}
                  onChange={(e) => setTenantSlug(e.target.value)}
                  placeholder="mi-inmobiliaria"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
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
                  placeholder="tu@inmobiliaria.com"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Contraseña
                </label>
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
                />
              </div>
            </>
          )}

          {needsOtp && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Código
              </label>
              <input
                required
                autoFocus
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
              />
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 border border-red-100 dark:border-red-900 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-medium py-2.5 hover:bg-slate-800 dark:hover:bg-slate-200 transition disabled:opacity-60"
          >
            {loading ? "Ingresando…" : needsOtp ? "Verificar" : "Ingresar"}
          </button>
          {needsOtp && (
            <button
              type="button"
              onClick={volver}
              className="w-full text-center text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50"
            >
              ← Volver
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
