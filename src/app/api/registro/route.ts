import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

const schema = z.object({
  inmobiliaria: z.string().min(2),
  nombre: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { inmobiliaria, nombre, email, password } = parsed.data;
  const baseSlug = slugify(inmobiliaria) || "inmobiliaria";
  let slug = baseSlug;
  let suffix = 1;
  while (await prisma.tenant.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${suffix++}`;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const tenant = await prisma.tenant.create({
    data: {
      name: inmobiliaria,
      slug,
      users: {
        create: {
          name: nombre,
          email,
          passwordHash,
          role: "ADMIN",
        },
      },
    },
  });

  return NextResponse.json({ tenantSlug: tenant.slug });
}
