"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function AdminSearchBox() {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <input
      defaultValue={searchParams.get("q") ?? ""}
      onChange={(e) => {
        const value = e.target.value;
        const params = new URLSearchParams(searchParams);
        if (value) params.set("q", value);
        else params.delete("q");
        router.replace(`/admin?${params.toString()}`);
      }}
      placeholder="Buscar por nombre o slug…"
      className="w-full sm:w-64 rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
    />
  );
}
