import { DefaultSession } from "next-auth";

interface AdminOrigin {
  id: string;
  email: string;
  name: string;
  tenantId: string;
  tenantSlug: string;
  tenantName: string;
  role: string;
}

declare module "next-auth" {
  interface User {
    tenantId: string;
    tenantSlug: string;
    tenantName: string;
    role: string;
  }

  interface Session {
    user: {
      id: string;
      tenantId: string;
      tenantSlug: string;
      tenantName: string;
      role: string;
      impersonating?: boolean;
      adminOrigin?: AdminOrigin | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    tenantId: string;
    tenantSlug: string;
    tenantName: string;
    role: string;
    // Presente solo durante una sesión de impersonación ("entrar como"):
    // identidad real del SUPERADMIN, para poder volver a /admin.
    adminOrigin?: AdminOrigin | null;
  }
}
