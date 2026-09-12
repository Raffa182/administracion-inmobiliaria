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
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Configuración</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {tenant?.name} · inmobiliaria <b>{tenant?.slug}</b>
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-4">Logo</h2>
        <div className="flex items-center gap-4 mb-4">
          {tenant?.logoFileData ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={tenant.logoFileData}
              alt={tenant.name}
              className="h-16 w-16 rounded-xl object-cover border border-slate-200 dark:border-slate-800"
            />
          ) : (
            <div className="h-16 w-16 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 text-xs">
              Sin logo
            </div>
          )}
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Se muestra en el encabezado del panel. Recomendado: imagen cuadrada.
          </p>
        </div>
        <LogoUploadForm />
      </div>
    </div>
  );
}
