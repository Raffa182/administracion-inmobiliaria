import { prisma } from "@/lib/prisma";

export async function verificarLimiteTenant(
  tenantId: string,
  recurso: "usuarios" | "propiedades"
): Promise<{ ok: true } | { ok: false; error: string }> {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { bonificado: true, maxUsuarios: true, maxPropiedades: true },
  });
  if (!tenant) return { ok: false, error: "Inmobiliaria no encontrada" };
  if (tenant.bonificado) return { ok: true };

  const limite = recurso === "usuarios" ? tenant.maxUsuarios : tenant.maxPropiedades;
  if (limite == null) return { ok: true };

  const actuales =
    recurso === "usuarios"
      ? await prisma.user.count({ where: { tenantId } })
      : await prisma.property.count({ where: { tenantId } });

  if (actuales >= limite) {
    const nombre = recurso === "usuarios" ? "usuarios" : "propiedades";
    return {
      ok: false,
      error: `Llegaste al límite de ${limite} ${nombre} de tu plan. Contacta a la plataforma para ampliarlo.`,
    };
  }

  return { ok: true };
}
