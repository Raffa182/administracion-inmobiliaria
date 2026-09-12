"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type View = "resumen" | "confirmar" | "codigos" | "desactivar" | "regenerar";

export function TwoFactorSettings({ initialEnabled }: { initialEnabled: boolean }) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(initialEnabled);
  const [view, setView] = useState<View>("resumen");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");

  const [password, setPassword] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);

  async function iniciarActivacion() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/2fa/generar", { method: "POST" });
    setLoading(false);
    if (!res.ok) {
      setError("No se pudo generar el código QR. Probá de nuevo.");
      return;
    }
    const data = await res.json();
    setQrDataUrl(data.qrDataUrl);
    setSecret(data.secret);
    setCode("");
    setView("confirmar");
  }

  async function confirmarActivacion(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/2fa/activar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Código incorrecto");
      return;
    }
    setEnabled(true);
    setBackupCodes(data.backupCodes);
    setView("codigos");
    router.refresh();
  }

  async function desactivar(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/2fa/desactivar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "No se pudo desactivar");
      return;
    }
    setEnabled(false);
    setPassword("");
    setView("resumen");
    router.refresh();
  }

  async function regenerarCodigos(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/2fa/regenerar-backup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "No se pudo regenerar los códigos");
      return;
    }
    setPassword("");
    setBackupCodes(data.backupCodes);
    setView("codigos");
  }

  function cancelar() {
    setError(null);
    setPassword("");
    setCode("");
    setView("resumen");
  }

  const card = "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6";
  const input =
    "w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100";
  const primaryBtn =
    "rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2 text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-200 disabled:opacity-60";
  const secondaryBtn =
    "rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800";

  if (view === "codigos" && backupCodes) {
    return (
      <div className={card}>
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-2">
          Guardá estos códigos de respaldo
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Si perdés el acceso a tu app de autenticación, podés usar uno de estos códigos en vez del
          código de 6 dígitos. Cada uno sirve una sola vez. No se van a volver a mostrar.
        </p>
        <div className="grid grid-cols-2 gap-2 font-mono text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-4 mb-4">
          {backupCodes.map((c) => (
            <span key={c} className="text-slate-900 dark:text-slate-50">
              {c}
            </span>
          ))}
        </div>
        <button className={primaryBtn} onClick={() => setView("resumen")}>
          Ya los guardé
        </button>
      </div>
    );
  }

  if (view === "confirmar") {
    return (
      <div className={card}>
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-2">
          Escaneá el código QR
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Usá Google Authenticator, Authy o similar. Si no podés escanear, ingresá esta clave manualmente:{" "}
          <code className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
            {secret}
          </code>
        </p>
        {qrDataUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qrDataUrl} alt="Código QR de verificación en dos pasos" className="w-48 h-48 mb-4 rounded-lg border border-slate-200 dark:border-slate-800" />
        )}
        <form onSubmit={confirmarActivacion} className="space-y-3 max-w-xs">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Código de 6 dígitos
            </label>
            <input
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              inputMode="numeric"
              className={input}
            />
          </div>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 border border-red-100 dark:border-red-900 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <button type="submit" disabled={loading} className={primaryBtn}>
              {loading ? "Confirmando…" : "Confirmar y activar"}
            </button>
            <button type="button" onClick={cancelar} className={secondaryBtn}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (view === "desactivar") {
    return (
      <div className={card}>
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-2">
          Desactivar verificación en dos pasos
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Confirmá tu contraseña para desactivarla.
        </p>
        <form onSubmit={desactivar} className="space-y-3 max-w-xs">
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Tu contraseña"
            className={input}
          />
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 border border-red-100 dark:border-red-900 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <button type="submit" disabled={loading} className={primaryBtn}>
              {loading ? "Desactivando…" : "Desactivar"}
            </button>
            <button type="button" onClick={cancelar} className={secondaryBtn}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (view === "regenerar") {
    return (
      <div className={card}>
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-2">
          Regenerar códigos de respaldo
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Los códigos actuales dejarán de funcionar. Confirmá tu contraseña para generar unos nuevos.
        </p>
        <form onSubmit={regenerarCodigos} className="space-y-3 max-w-xs">
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Tu contraseña"
            className={input}
          />
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 border border-red-100 dark:border-red-900 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <button type="submit" disabled={loading} className={primaryBtn}>
              {loading ? "Generando…" : "Generar nuevos códigos"}
            </button>
            <button type="button" onClick={cancelar} className={secondaryBtn}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className={card}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            Verificación en dos pasos
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {enabled
              ? "Activada: además de tu contraseña, te vamos a pedir un código de tu app de autenticación al ingresar."
              : "Agregá una capa extra de seguridad a tu cuenta con una app como Google Authenticator o Authy."}
          </p>
        </div>
        <span
          className={`shrink-0 h-2 w-2 rounded-full ${enabled ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"}`}
          aria-hidden
        />
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 border border-red-100 dark:border-red-900 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="mt-4 flex gap-2">
        {enabled ? (
          <>
            <button onClick={() => setView("regenerar")} className={secondaryBtn}>
              Regenerar códigos de respaldo
            </button>
            <button onClick={() => setView("desactivar")} className={secondaryBtn}>
              Desactivar
            </button>
          </>
        ) : (
          <button onClick={iniciarActivacion} disabled={loading} className={primaryBtn}>
            {loading ? "Generando…" : "Activar verificación en dos pasos"}
          </button>
        )}
      </div>
    </div>
  );
}
