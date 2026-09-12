import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SignOutButton } from "@/components/sign-out-button";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (session?.user?.role !== "SUPERADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 flex items-center justify-center rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold text-sm">
              SA
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-50 leading-tight">
                Panel de plataforma
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight">{session.user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 py-8">{children}</main>
    </div>
  );
}
