import crypto from "crypto";

export function hashPortalToken(raw: string) {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

export function createPortalToken() {
  const raw = crypto.randomBytes(32).toString("base64url");
  return { raw, hash: hashPortalToken(raw) };
}
