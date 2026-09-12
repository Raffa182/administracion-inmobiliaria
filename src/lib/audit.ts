import { prisma } from "@/lib/prisma";

export async function logAdminAction(params: {
  actorUserId: string;
  actorEmail: string;
  action: string;
  targetTenantId?: string;
  targetTenantSlug?: string;
  targetTenantName?: string;
  targetUserEmail?: string;
  details?: string;
}) {
  await prisma.adminAuditLog.create({
    data: {
      actorUserId: params.actorUserId,
      actorEmail: params.actorEmail,
      action: params.action,
      targetTenantId: params.targetTenantId,
      targetTenantSlug: params.targetTenantSlug,
      targetTenantName: params.targetTenantName,
      targetUserEmail: params.targetUserEmail,
      details: params.details,
    },
  });
}
