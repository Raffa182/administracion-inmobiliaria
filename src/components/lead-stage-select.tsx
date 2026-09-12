"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { leadPipelineStages, leadStageLabels } from "@/lib/labels";

export function LeadStageSelect({ leadId, stage }: { leadId: string; stage: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setLoading(true);
    await fetch(`/api/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: e.target.value }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <select
      value={stage}
      onChange={onChange}
      disabled={loading}
      onClick={(e) => e.stopPropagation()}
      className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 text-xs px-2 py-1 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 disabled:opacity-60"
    >
      {leadPipelineStages.map((s) => (
        <option key={s} value={s}>
          {leadStageLabels[s]}
        </option>
      ))}
      <option value="PERDIDO">Perdido</option>
    </select>
  );
}
