import type { NextAuthConfig } from "next-auth";

// Configuración "edge-safe": no importa Prisma ni bcrypt para poder
// correr dentro del middleware (Edge Runtime). Los providers con
// dependencias de Node se agregan en src/lib/auth.ts.
export const authConfig = {
  trustHost: true,
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    authorized: ({ auth, request }) => {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;
      const isAdminRoute = pathname.startsWith("/admin");
      const isProtected = pathname.startsWith("/dashboard") || isAdminRoute;
      if (isProtected && !isLoggedIn) return false;
      if (isAdminRoute && auth?.user?.role !== "SUPERADMIN") return false;
      return true;
    },
    jwt: async ({ token, user }) => {
      if (user) {
        token.tenantId = user.tenantId;
        token.tenantSlug = user.tenantSlug;
        token.tenantName = user.tenantName;
        token.role = user.role;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.tenantId = token.tenantId as string;
        session.user.tenantSlug = token.tenantSlug as string;
        session.user.tenantName = token.tenantName as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
