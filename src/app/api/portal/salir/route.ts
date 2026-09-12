import { NextResponse } from "next/server";
import { PORTAL_COOKIE_NAME } from "@/lib/portal-session";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(PORTAL_COOKIE_NAME, "", { path: "/", maxAge: 0 });
  return res;
}
