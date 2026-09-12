"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/sign-out-button";

type NavItem = { href: string; label: string; icon: keyof typeof icons; adminOnly?: boolean };

const navGroups: NavItem[][] = [
  [
    { href: "/dashboard", label: "Home", icon: "home" },
    { href: "/dashboard/alquileres", label: "Alquileres", icon: "sheet" },
    { href: "/dashboard/reservas", label: "Reservas", icon: "bookmark" },
    { href: "/dashboard/ventas", label: "Ventas", icon: "trending" },
    { href: "/dashboard/propiedades", label: "Propiedades", icon: "building" },
  ],
  [
    { href: "/dashboard/leads", label: "Leads", icon: "user" },
    { href: "/dashboard/agenda", label: "Agenda", icon: "calendar" },
  ],
  [
    { href: "/dashboard/equipo", label: "Equipo", icon: "team", adminOnly: true },
    { href: "/dashboard/configuracion", label: "Configuración", icon: "gear", adminOnly: true },
  ],
];

const icons = {
  home: (
    <path d="M3 11.5 12 4l9 7.5M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" strokeLinecap="round" strokeLinejoin="round" />
  ),
  sheet: <path d="M4 3h16v18H4zM9 8h1M14 8h1M9 12h1M14 12h1M9 16h1M14 16h1" />,
  bookmark: <path d="M6 3h12v18l-6-4-6 4Z" strokeLinecap="round" strokeLinejoin="round" />,
  trending: <path d="M12 5v14M5 12h14" strokeLinecap="round" />,
  building: (
    <path d="M3 21h18M6 21V9l6-4 6 4v12M10 21v-5h4v5" strokeLinecap="round" strokeLinejoin="round" />
  ),
  user: <path d="M12 4.8a3.2 3.2 0 1 1 0 6.4 3.2 3.2 0 0 1 0-6.4ZM5 20c1-3.5 4-5.5 7-5.5s6 2 7 5.5" strokeLinecap="round" strokeLinejoin="round" />,
  calendar: <path d="M3 5h18v16H3zM3 10h18M8 3v4M16 3v4" strokeLinecap="round" strokeLinejoin="round" />,
  team: <path d="M9 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2 20c0-3.3 3-6 7-6M17 11l1.5 1.5L22 9" strokeLinecap="round" strokeLinejoin="round" />,
  gear: (
    <path
      d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19.4 13a7.6 7.6 0 0 0 0-2l2-1.5-2-3.4-2.4 1a7.6 7.6 0 0 0-1.7-1L15 3h-4l-.3 2.6a7.6 7.6 0 0 0-1.7 1l-2.4-1-2 3.4L6.6 11a7.6 7.6 0 0 0 0 2l-2 1.5 2 3.4 2.4-1a7.6 7.6 0 0 0 1.7 1L11 21h4l.3-2.6a7.6 7.6 0 0 0 1.7-1l2.4 1 2-3.4Z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
};

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardSidebar({
  tenantName,
  tenantLogo,
  userEmail,
  userInitials,
  isAdmin,
}: {
  tenantName: string;
  tenantLogo: string | null;
  userEmail: string;
  userInitials: string;
  isAdmin: boolean;
}) {
  const pathname = usePathname();

  return (
    <aside className="w-16 lg:w-60 shrink-0 bg-slate-900 flex flex-col gap-6 py-5 px-2 lg:px-3.5">
      <div className="flex items-center gap-2.5 px-1 lg:px-1.5">
        {tenantLogo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={tenantLogo} alt={tenantName} className="h-8 w-8 rounded-lg object-cover shrink-0" />
        ) : (
          <div className="h-8 w-8 rounded-lg bg-teal-400 text-slate-900 flex items-center justify-center font-bold text-[13px] shrink-0">
            GI
          </div>
        )}
        <span className="hidden lg:block min-w-0 text-[13px] font-semibold text-white truncate">{tenantName}</span>
      </div>

      <nav className="flex flex-col gap-4">
        {navGroups.map((group, i) => {
          const visible = group.filter((item) => !item.adminOnly || isAdmin);
          if (visible.length === 0) return null;
          return (
            <div key={i} className="flex flex-col gap-0.5">
              {i > 0 && <div className="h-px bg-white/10 mx-1.5 mb-1.5" />}
              {visible.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative flex items-center gap-2.5 rounded-lg px-2.5 lg:px-3 py-2 text-[13px] font-medium justify-center lg:justify-start ${
                      active ? "bg-white/10 text-white" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                    }`}
                  >
                    {active && (
                      <span className="hidden lg:block absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-teal-400" />
                    )}
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
                      {icons[item.icon]}
                    </svg>
                    <span className="hidden lg:inline truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      <div className="mt-auto flex items-center gap-2.5 rounded-xl bg-white/5 px-2 lg:px-2.5 py-2.5">
        <div className="h-7 w-7 rounded-full bg-teal-400 text-slate-900 flex items-center justify-center text-[11px] font-bold shrink-0">
          {userInitials}
        </div>
        <div className="hidden lg:block min-w-0 flex-1">
          <p className="text-xs font-medium text-white truncate">{userEmail}</p>
          <SignOutButton className="text-[11px] text-slate-400 hover:text-white transition" />
        </div>
      </div>
    </aside>
  );
}
