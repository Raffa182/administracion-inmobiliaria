import { DefaultSession } from "next-auth";

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
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    tenantId: string;
    tenantSlug: string;
    tenantName: string;
    role: string;
  }
}
