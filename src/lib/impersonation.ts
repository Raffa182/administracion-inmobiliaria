import { encode } from "next-auth/jwt";
import type { NextRequest } from "next/server";

const SESSION_COOKIE_SUFFIX = "authjs.session-token";

// El nombre exacto de la cookie de sesión de Auth.js depende de si se usa
// HTTPS (prefijo "__Secure-"). En vez de asumirlo, lo leemos de la propia
// cookie que ya trae la request (el usuario ya está logueado como super
// admin en ese momento).
export function getSessionCookieName(req: NextRequest) {
  const found = req.cookies.getAll().find((c) => c.name.endsWith(SESSION_COOKIE_SUFFIX));
  return found?.name ?? SESSION_COOKIE_SUFFIX;
}

export function isSecureCookieName(name: string) {
  return name.startsWith("__Secure-") || name.startsWith("__Host-");
}

export async function encodeSessionToken(
  payload: Record<string, unknown>,
  cookieName: string
) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET no configurado");
  // `salt` debe coincidir con el nombre de cookie que usa Auth.js internamente
  // para derivar la clave de cifrado (ver @auth/core/lib/actions/callback).
  return encode({ token: payload, secret, salt: cookieName });
}
