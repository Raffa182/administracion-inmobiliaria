import { addDays } from "date-fns";
import { prisma } from "./prisma";

const CONTRACT_WARNING_DAYS = 60; // mismo horizonte que "Por vencer" en /dashboard
const PAYMENT_WARNING_DAYS = 14;
const RESERVATION_STALE_DAYS = 15;

// Alertas internas del tenant: nada de esto envía un email todavía, solo
// se calcula al vuelo desde los datos que ya existen (sin tabla propia).
export async function getAlerts(tenantId: string) {
  const now = new Date();
  const contractHorizon = addDays(now, CONTRACT_WARNING_DAYS);
  const paymentHorizon = addDays(now, PAYMENT_WARNING_DAYS);
  const reservationStaleBefore = addDays(now, -RESERVATION_STALE_DAYS);

  const [expiringContracts, overduePayments, upcomingPayments, staleReservations] =
    await Promise.all([
      prisma.contract.findMany({
        where: { tenantId, status: "ACTIVO", endDate: { lte: contractHorizon } },
        include: { property: true, renter: true },
        orderBy: { endDate: "asc" },
      }),
      prisma.payment.findMany({
        where: {
          tenantId,
          status: { in: ["PENDIENTE", "VENCIDO"] },
          dueDate: { lt: now },
        },
        include: { contract: { include: { property: true, renter: true } } },
        orderBy: { dueDate: "asc" },
      }),
      prisma.payment.findMany({
        where: {
          tenantId,
          status: "PENDIENTE",
          dueDate: { gte: now, lte: paymentHorizon },
        },
        include: { contract: { include: { property: true, renter: true } } },
        orderBy: { dueDate: "asc" },
      }),
      prisma.reservation.findMany({
        where: { tenantId, status: "ACTIVA", reservationDate: { lte: reservationStaleBefore } },
        include: { property: true, renter: true },
        orderBy: { reservationDate: "asc" },
      }),
    ]);

  return { expiringContracts, overduePayments, upcomingPayments, staleReservations };
}

export type Alerts = Awaited<ReturnType<typeof getAlerts>>;

export function countAlerts(alerts: Alerts) {
  return (
    alerts.expiringContracts.length +
    alerts.overduePayments.length +
    alerts.upcomingPayments.length +
    alerts.staleReservations.length
  );
}
