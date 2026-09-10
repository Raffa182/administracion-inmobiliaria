"use client";

import { useState } from "react";

export function PickOrCreate({
  label,
  name,
  options,
  newLabel,
  children,
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  newLabel: string;
  children: React.ReactNode;
}) {
  const [creating, setCreating] = useState(options.length === 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        {options.length > 0 && (
          <button
            type="button"
            onClick={() => setCreating((c) => !c)}
            className="text-xs text-slate-500 hover:text-slate-900 underline"
          >
            {creating ? "Elegir existente" : newLabel}
          </button>
        )}
      </div>
      {!creating ? (
        <select
          name={name}
          required
          defaultValue=""
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
        >
          <option value="" disabled>
            Seleccionar…
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <div className="space-y-3 rounded-lg border border-dashed border-slate-300 p-3">
          {children}
        </div>
      )}
    </div>
  );
}
