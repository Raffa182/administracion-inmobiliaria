import crypto from "crypto";
import bcrypt from "bcryptjs";
import { generateSecret, generateURI, verify } from "otplib";

const ISSUER = "Gestión Inmobiliaria";

export function generateTwoFactorSecret() {
  return generateSecret();
}

export function twoFactorKeyUri(email: string, secret: string) {
  return generateURI({ issuer: ISSUER, label: email, secret });
}

export async function verifyTwoFactorToken(token: string, secret: string) {
  try {
    // Tolerancia de ±30s (un paso) para relojes de celular desincronizados.
    const result = await verify({ token, secret, epochTolerance: 30 });
    return result.valid;
  } catch {
    return false;
  }
}

// Formato XXXXX-XXXXX en hex mayúscula: fácil de transcribir a mano, y
// suficientemente distinto de un código TOTP de 6 dígitos para no confundirlos.
export function generateBackupCodes(count = 8): string[] {
  return Array.from({ length: count }, () => {
    const raw = crypto.randomBytes(5).toString("hex").toUpperCase();
    return `${raw.slice(0, 5)}-${raw.slice(5, 10)}`;
  });
}

export async function hashBackupCodes(codes: string[]): Promise<string> {
  const hashed = await Promise.all(codes.map((code) => bcrypt.hash(code, 10)));
  return JSON.stringify(hashed);
}

// Si `code` coincide con alguno de los hashes guardados, devuelve el JSON
// restante (sin ese hash, para que no se pueda reutilizar). Si no coincide
// con ninguno, devuelve null.
export async function consumeBackupCode(
  storedJson: string | null,
  code: string
): Promise<string | null> {
  if (!storedJson) return null;
  let hashes: string[];
  try {
    hashes = JSON.parse(storedJson);
  } catch {
    return null;
  }
  for (let i = 0; i < hashes.length; i++) {
    if (await bcrypt.compare(code, hashes[i])) {
      return JSON.stringify([...hashes.slice(0, i), ...hashes.slice(i + 1)]);
    }
  }
  return null;
}

export function isBackupCodeFormat(value: string) {
  return /^[0-9a-f]{5}-[0-9a-f]{5}$/i.test(value.trim());
}
