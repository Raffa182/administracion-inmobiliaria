import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { logAdminAction } from "@/lib/audit";

const schema = z.object({
  inmobiliaria: z.string().min(2),
  nombreAdmin: z.string().min(2),
  emailAdmin: z.string().email(),
  passwordAdmin: z.string().min(6),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (session.user.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  const { inmobiliaria, nombreAdmin, emailAdmin, passwordAdmin } = parsed.data;

  const baseSlug = slugify(inmobiliaria) || "inmobiliaria";
  let slug = baseSlug;
  let suffix = 1;
  while (await prisma.tenant.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${suffix++}`;
  }

  const passwordHash = await bcrypt.hash(passwordAdmin, 10);

  const tenant = await prisma.tenant.create({
    data: {
      name: inmobiliaria,
      slug,
      users: {
        create: {
          name: nombreAdmin,
          email: emailAdmin,
          passwordHash,
          role: "ADMIN",
        },
      },
    },
  });

  await logAdminAction({
    actorUserId: session.user.id,
    actorEmail: session.user.email ?? "",
    action: "CREAR_TENANT",
    targetTenantId: tenant.id,
    targetTenantSlug: tenant.slug,
    targetTenantName: tenant.name,
    targetUserEmail: emailAdmin,
  });

  return NextResponse.json(tenant);
}
