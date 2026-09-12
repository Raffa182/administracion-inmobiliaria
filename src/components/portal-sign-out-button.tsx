"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PortalSignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onClick() {
    setLoading(true);
    await fetch("/api/portal/salir", { method: "POST" });
    router.push("/portal/entrar");
    router.refresh();
  }

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="text-sm font-medium text-slate-500 hover:text-slate-900 transition disabled:opacity-60"
    >
      {loading ? "Saliendo…" : "Salir"}
    </button>
  );
}
