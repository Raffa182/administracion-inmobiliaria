"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NuevaPropiedadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const payload = {
      address: form.get("address"),
      unit: form.get("unit"),
      city: form.get("city"),
      type: form.get("type"),
      listingType: form.get("listingType"),
      squareMeters: form.get("squareMeters"),
      rooms: form.get("rooms"),
      petsAllowed: form.get("petsAllowed") === "on",
      appliancesIncluded: form.get("appliancesIncluded") === "on",
      furnished: form.get("furnished") === "on",
      hasParking: form.get("hasParking") === "on",
      inUrbanizacion: form.get("inUrbanizacion") === "on",
      complexName: form.get("complexName"),
      askingRent: form.get("askingRent"),
      askingSale: form.get("askingSale"),
      notes: form.get("notes"),
      ownerName: form.get("ownerName"),
      ownerEmail: form.get("ownerEmail"),
      ownerPhone: form.get("ownerPhone"),
    };

    const res = await fetch("/api/propiedades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!res.ok) {
      setError("No se pudo crear la propiedad. Revisa los datos.");
      return;
    }

    const { id } = await res.json();
    router.push(`/dashboard/propiedades/${id}`);
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold text-slate-900">Nueva propiedad</h1>
      <p className="text-sm text-slate-500 mt-1">
        Completa la ficha del inmueble. Después vas a poder sumar fotos y documentos.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-6">
        <Section title="Datos generales">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Dirección" name="address" required placeholder="Calle Alcalá 25, 3ºB" />
            <Field label="Ciudad" name="city" placeholder="Madrid" />
            <Field label="Tipo" name="type" placeholder="Piso" defaultValue="Piso" />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Se ofrece en</label>
              <select
                name="listingType"
                defaultValue="ALQUILER"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="ALQUILER">Alquiler</option>
                <option value="VENTA">Venta</option>
                <option value="ALQUILER_Y_VENTA">Alquiler y venta</option>
              </select>
            </div>
          </div>
        </Section>

        <Section title="Ficha">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Metros cuadrados" name="squareMeters" type="number" min={0} placeholder="75" />
            <Field label="Habitaciones" name="rooms" type="number" min={0} placeholder="2" />
            <Field label="Precio de alquiler orientativo (€)" name="askingRent" type="number" min={0} placeholder="750" />
            <Field label="Precio de venta orientativo (€)" name="askingSale" type="number" min={0} placeholder="180000" />
          </div>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Checkbox name="petsAllowed" label="Admite mascotas" />
            <Checkbox name="appliancesIncluded" label="Con electrodomésticos" />
            <Checkbox name="furnished" label="Amueblado" />
            <Checkbox name="hasParking" label="Con parking" />
          </div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <Checkbox name="inUrbanizacion" label="Está en una urbanización" />
            <Field label="Nombre de la urbanización" name="complexName" placeholder="Opcional" />
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

        <Section title="Propietario (opcional)">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Nombre" name="ownerName" placeholder="María Fernández" />
            <Field label="Email" name="ownerEmail" type="email" placeholder="maria@propietaria.com" />
            <Field label="Teléfono" name="ownerPhone" placeholder="+34 611 222 333" />
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
            {loading ? "Guardando…" : "Crear propiedad"}
          </button>
        </div>
      </form>
    </div>
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

function Checkbox({ name, label }: { name: string; label: string }) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-700">
      <input name={name} type="checkbox" className="rounded border-slate-300" />
      {label}
    </label>
  );
}
