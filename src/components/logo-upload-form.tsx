"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function LogoUploadForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const data = new FormData(form);
    const file = data.get("file") as File | null;
    if (!file || file.size === 0) {
      setError("Elegí una imagen.");
      return;
    }

    setLoading(true);
    const fileData = await fileToDataUrl(file);

    const res = await fetch("/api/tenant/logo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName: file.name, fileData }),
    });

    setLoading(false);

    if (!res.ok) {
      setError("No se pudo subir el logo. Verificá que sea una imagen.");
      return;
    }

    form.reset();
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input
        name="file"
        type="file"
        accept="image/*"
        required
        className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-sm file:mr-2 file:rounded-md file:border-0 file:bg-slate-100 file:px-2 file:py-1 file:text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-medium px-4 py-2 hover:bg-slate-800 dark:hover:bg-slate-200 transition disabled:opacity-60"
      >
        {loading ? "Subiendo…" : "Guardar logo"}
      </button>
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </form>
  );
}
