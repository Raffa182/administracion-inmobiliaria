"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PickOrCreate } from "@/components/pick-or-create";

export function VentaForm({
  properties,
  buyers,
}: {
  properties: { id: string; address: string }[];
  buyers: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [buyerMode, setBuyerMode] = useState<"none" | "existing" | "new">("none");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const payload = {
      propertyId: form.get("propertyId") || undefined,
      propertyAddress: form.get("propertyAddress") || undefined,
      propertyType: form.get("propertyType") || undefined,
      buyerId: form.get("buyerId") || undefined,
      buyerName: form.get("buyerName") || undefined,
      buyerDni: form.get("buyerDni") || undefined,
      buyerEmail: form.get("buyerEmail") || undefined,
      buyerPhone: form.get("buyerPhone") || undefined,
      price: form.get("price"),
      notes: form.get("notes") || undefined,
    };

    const res = await fetch("/api/ventas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!res.ok) {
      setError("No se pudo crear la venta. Revisa los datos.");
      return;
    }

    const { id } = await res.json();
    router.push(`/dashboard/ventas/${id}`);
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-6">
      <Section title="Propiedad">
        <PickOrCreate
          label="Propiedad"
          name="propertyId"
          options={properties.map((p) => ({ value: p.id, label: p.address }))}
          newLabel="+ Nueva propiedad"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Dirección" name="propertyAddress" placeholder="Calle Alcalá 25, 3ºB" />
            <Field label="Tipo" name="propertyType" placeholder="Piso" defaultValue="Piso" />
          </div>
        </PickOrCreate>
      </Section>

      <Section title="Comprador (opcional)">
        <div className="flex gap-2 mb-3">
          <ModeButton active={buyerMode === "none"} onClick={() => setBuyerMode("none")}>
            Todavía sin comprador
          </ModeButton>
          {buyers.length > 0 && (
            <ModeButton active={buyerMode === "existing"} onClick={() => setBuyerMode("existing")}>
              Comprador existente
            </ModeButton>
          )}
          <ModeButton active={buyerMode === "new"} onClick={() => setBuyerMode("new")}>
            Nuevo comprador
          </ModeButton>
        </div>

        {buyerMode === "existing" && (
          <select
            name="buyerId"
            defaultValue=""
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
          >
            <option value="" disabled>
              Seleccionar…
            </option>
            {buyers.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        )}

        {buyerMode === "new" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Nombre y apellido" name="buyerName" placeholder="Ana Torres" />
            <Field label="DNI / NIE" name="buyerDni" placeholder="12345678Z" />
            <Field label="Email" name="buyerEmail" type="email" placeholder="ana@mail.com" />
            <Field label="Teléfono" name="buyerPhone" placeholder="+34 611 234 567" />
          </div>
        )}
      </Section>

      <Section title="Datos de la venta">
        <Field label="Precio (€)" name="price" type="number" min={0} required placeholder="180000" />
        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notas</label>
          <textarea
            name="notes"
            rows={3}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
          />
        </div>
      </Section>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 border border-red-100 dark:border-red-900 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-medium px-5 py-2.5 hover:bg-slate-800 dark:hover:bg-slate-200 transition disabled:opacity-60"
        >
          {loading ? "Guardando…" : "Crear venta"}
        </button>
      </div>
    </form>
  );
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
        active
          ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100"
          : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
      }`}
    >
      {children}
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
      <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  defaultValue,
  min,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string | number;
  min?: number;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        min={min}
        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
      />
    </div>
  );
}
