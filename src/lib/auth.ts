import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";
import { consumeBackupCode, isBackupCodeFormat, verifyTwoFactorToken } from "@/lib/two-factor";

// Códigos distintos para que el login pueda mostrar el paso de 2FA sin
// filtrar si el email/contraseña eran correctos (ver signIn.code en el cliente).
class TwoFactorRequiredError extends CredentialsSignin {
  code = "2FA_REQUIRED";
}
class TwoFactorInvalidError extends CredentialsSignin {
  code = "2FA_INVALIDO";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
        tenantSlug: { label: "Inmobiliaria", type: "text" },
        otp: { label: "Código de verificación", type: "text" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        const tenantSlug = credentials?.tenantSlug as string | undefined;
        const otp = (credentials?.otp as string | undefined)?.trim();
        if (!email || !password || !tenantSlug) return null;

        const tenant = await prisma.tenant.findUnique({
          where: { slug: tenantSlug },
        });
        if (!tenant || !tenant.active) return null;

        const user = await prisma.user.findUnique({
          where: { tenantId_email: { tenantId: tenant.id, email } },
        });
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        if (user.twoFactorEnabled) {
          if (!otp) throw new TwoFactorRequiredError();

          let otpOk = false;
          if (isBackupCodeFormat(otp)) {
            const remaining = await consumeBackupCode(user.twoFactorBackupCodes, otp);
            if (remaining !== null) {
              otpOk = true;
              await prisma.user.update({
                where: { id: user.id },
                data: { twoFactorBackupCodes: remaining },
              });
            }
          } else {
            otpOk = await verifyTwoFactorToken(otp, user.twoFactorSecret!);
          }
          if (!otpOk) throw new TwoFactorInvalidError();
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          tenantId: tenant.id,
          tenantSlug: tenant.slug,
          tenantName: tenant.name,
          role: user.role,
        };
      },
    }),
  ],
});
