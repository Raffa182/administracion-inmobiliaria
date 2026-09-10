"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PickOrCreate } from "@/components/pick-or-create";

export function ReservaForm({
  properties,
  renters,
}: {
  properties: { id: string; address: string }[];
  renters: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const payload = {
      propertyId: form.get("propertyId") || undefined,
      propertyAddress: form.get("propertyAddress") || undefined,
      propertyType: form.get("propertyType") || undefined,
      renterId: form.get("renterId") || undefined,
      renterName: form.get("renterName") || undefined,
      renterDni: form.get("renterDni") || undefined,
      renterEmail: form.get("renterEmail") || undefined,
      renterPhone: form.get("renterPhone") || undefined,
      reservationDate: form.get("reservationDate"),
      amount: form.get("amount"),
      notes: form.get("notes") || undefined,
    };

    const res = await fetch("/api/reservas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!res.ok) {
      setError("No se pudo crear la reserva. Revisa los datos.");
      return;
    }

    const { id } = await res.json();
    router.push(`/dashboard/reservas/${id}`);
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

      <Section title="Inquilino">
        <PickOrCreate
          label="Inquilino"
          name="renterId"
          options={renters.map((r) => ({ value: r.id, label: r.name }))}
          newLabel="+ Nuevo inquilino"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Nombre y apellido" name="renterName" placeholder="Juan Pérez" />
            <Field label="DNI / NIE" name="renterDni" placeholder="12345678Z" />
            <Field label="Email" name="renterEmail" type="email" placeholder="juan@mail.com" />
            <Field label="Teléfono" name="renterPhone" placeholder="+34 611 234 567" />
          </div>
        </PickOrCreate>
      </Section>

      <Section title="Datos de la reserva">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Fecha de la reserva" name="reservationDate" type="date" required />
          <Field label="Seña / honorarios (€)" name="amount" type="number" min={0} required placeholder="750" />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">Notas</label>
          <textarea
            name="notes"
            rows={3}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>
      </Section>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-slate-900 text-white text-sm font-medium px-5 py-2.5 hover:bg-slate-800 transition disabled:opacity-60"
        >
          {loading ? "Guardando…" : "Crear reserva"}
        </button>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <h2 className="text-sm font-semibold text-slate-900 mb-4">{title}</h2>
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
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        min={min}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
      />
    </div>
  );
}
