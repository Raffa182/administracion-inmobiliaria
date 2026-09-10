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

export default function NuevoContratoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileData, setFileData] = useState<string | null>(null);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setFileData(await fileToDataUrl(file));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const payload = {
      propertyAddress: form.get("propertyAddress"),
      propertyType: form.get("propertyType"),
      renterName: form.get("renterName"),
      renterDni: form.get("renterDni"),
      renterEmail: form.get("renterEmail"),
      renterPhone: form.get("renterPhone"),
      startDate: form.get("startDate"),
      endDate: form.get("endDate"),
      rentAmount: form.get("rentAmount"),
      adjustmentFrequencyMonths: form.get("adjustmentFrequencyMonths"),
      contractFileName: fileName ?? undefined,
      contractFileData: fileData ?? undefined,
    };

    const res = await fetch("/api/contratos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!res.ok) {
      setError("No se pudo crear el contrato. Revisa los datos.");
      return;
    }

    const { id } = await res.json();
    router.push(`/dashboard/contratos/${id}`);
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold text-slate-900">Nuevo contrato de alquiler</h1>
      <p className="text-sm text-slate-500 mt-1">
        Carga la propiedad, el inquilino y las condiciones del contrato
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-6">
        <Section title="Propiedad">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Dirección" name="propertyAddress" required placeholder="Calle Alcalá 25, 3ºB" />
            <Field label="Tipo" name="propertyType" placeholder="Piso" defaultValue="Piso" />
          </div>
        </Section>

        <Section title="Inquilino">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nombre y apellido" name="renterName" required placeholder="Juan Pérez" />
            <Field label="DNI / NIE" name="renterDni" placeholder="12345678Z" />
            <Field label="Email" name="renterEmail" type="email" placeholder="juan@mail.com" />
            <Field label="Teléfono" name="renterPhone" placeholder="+34 611 234 567" />
          </div>
        </Section>

        <Section title="Condiciones del contrato">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Fecha de inicio" name="startDate" type="date" required />
            <Field label="Fecha de fin" name="endDate" type="date" required />
            <Field label="Monto del alquiler (€)" name="rentAmount" type="number" min={0} required placeholder="750" />
            <Field
              label="Actualiza cada (meses)"
              name="adjustmentFrequencyMonths"
              type="number"
              min={1}
              defaultValue={12}
              required
            />
          </div>
        </Section>

        <Section title="Contrato digitalizado">
          <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center cursor-pointer hover:bg-slate-100 transition">
            <input type="file" accept="application/pdf,image/*" className="hidden" onChange={onFileChange} />
            <p className="text-sm font-medium text-slate-700">
              {fileName ?? "Subir contrato firmado (PDF o imagen)"}
            </p>
            <p className="text-xs text-slate-400 mt-1">Opcional, se puede agregar después</p>
          </label>
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
            {loading ? "Guardando…" : "Crear contrato"}
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
