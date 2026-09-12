import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TwoFactorSettings } from "@/components/two-factor-settings";

export default async function SeguridadPage() {
  const session = await auth();
  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
    select: { email: true, twoFactorEnabled: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin" className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50">
          ← Volver
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-50">Seguridad</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Verificación en dos pasos para tu cuenta de super admin.
        </p>
      </div>

      <TwoFactorSettings initialEnabled={user?.twoFactorEnabled ?? false} />
    </div>
  );
}
