import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

// Crea (o actualiza) el primer super admin con credenciales propias, sin
// tocar ni crear la inmobiliaria de demo. Pensado para el primer arranque
// en producción, donde no se quiere usar el usuario fijo del seed.
async function main() {
  const email = process.env.SUPERADMIN_EMAIL;
  const password = process.env.SUPERADMIN_PASSWORD;
  const name = process.env.SUPERADMIN_NAME ?? "Super Admin";
  const tenantName = process.env.SUPERADMIN_TENANT_NAME ?? "Plataforma";
  const tenantSlug = process.env.SUPERADMIN_TENANT_SLUG ?? "plataforma";

  if (!email || !password) {
    console.error(
      "Faltan variables de entorno: SUPERADMIN_EMAIL y SUPERADMIN_PASSWORD son obligatorias."
    );
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("SUPERADMIN_PASSWORD debe tener al menos 8 caracteres.");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const tenant = await prisma.tenant.upsert({
    where: { slug: tenantSlug },
    update: {},
    create: { name: tenantName, slug: tenantSlug },
  });

  await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email } },
    update: { name, passwordHash, role: "SUPERADMIN" },
    create: { tenantId: tenant.id, name, email, passwordHash, role: "SUPERADMIN" },
  });

  console.log(`Super admin listo: inmobiliaria "${tenantSlug}" / ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
