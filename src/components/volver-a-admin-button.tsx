"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function VolverAAdminButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onClick() {
    setLoading(true);
    const res = await fetch("/api/admin/impersonar/salir", { method: "POST" });
    if (!res.ok) {
      setLoading(false);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="shrink-0 rounded-lg bg-white dark:bg-slate-900/20 hover:bg-white/30 px-3 py-1 font-medium transition disabled:opacity-60"
    >
      {loading ? "Volviendo…" : "Volver a admin"}
    </button>
  );
}
