import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LogoUploadForm } from "@/components/logo-upload-form";

export default async function ConfiguracionPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id: session.user.tenantId },
    select: { name: true, slug: true, logoFileData: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Configuración</h1>
        <p className="text-sm text-slate-500 mt-1">
          {tenant?.name} · inmobiliaria <b>{tenant?.slug}</b>
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">Logo</h2>
        <div className="flex items-center gap-4 mb-4">
          {tenant?.logoFileData ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={tenant.logoFileData}
              alt={tenant.name}
              className="h-16 w-16 rounded-xl object-cover border border-slate-200"
            />
          ) : (
            <div className="h-16 w-16 flex items-center justify-center rounded-xl bg-slate-100 text-slate-400 text-xs">
              Sin logo
            </div>
          )}
          <p className="text-xs text-slate-500">
            Se muestra en el encabezado del panel. Recomendado: imagen cuadrada.
          </p>
        </div>
        <LogoUploadForm />
      </div>
    </div>
  );
}
