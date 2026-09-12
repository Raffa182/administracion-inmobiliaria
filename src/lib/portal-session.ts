import { encode, decode } from "next-auth/jwt";
import { cookies } from "next/headers";

export const PORTAL_COOKIE_NAME = "portal-session";

// Salt fijo propio: esta sesión no tiene nada que ver con el JWT de
// Auth.js del staff, solo se reutiliza su encode/decode como utilidad.
const PORTAL_SALT = "portal-session-token";

export type PortalSession = {
  tenantId: string;
  tenantSlug: string;
  tenantName: string;
  personType: "RENTER" | "BUYER";
  personId: string;
  name: string;
  email: string;
};

export async function encodePortalSession(payload: PortalSession) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET no configurado");
  return encode({ token: payload, secret, salt: PORTAL_SALT });
}

export async function getPortalSession(): Promise<PortalSession | null> {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;
  const store = await cookies();
  const token = store.get(PORTAL_COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const decoded = await decode({ token, secret, salt: PORTAL_SALT });
    if (!decoded) return null;
    return decoded as unknown as PortalSession;
  } catch {
    return null;
  }
}
