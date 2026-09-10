import bcrypt from "bcryptjs";
import { addDays, addMonths, subMonths } from "date-fns";
import { prisma } from "../src/lib/prisma";
import { generateReceiptPdf } from "../src/lib/receipt";

async function main() {
  await prisma.tenant.deleteMany({ where: { slug: "demo" } });

  const passwordHash = await bcrypt.hash("demo1234", 10);

  const tenant = await prisma.tenant.create({
    data: {
      name: "Inmobiliaria Demo",
      slug: "demo",
      users: {
        create: {
          name: "Admin Demo",
          email: "demo@inmobiliaria.com",
          passwordHash,
          role: "ADMIN",
        },
      },
    },
  });

  const owner = await prisma.owner.create({
    data: {
      tenantId: tenant.id,
      name: "María Fernández",
      email: "maria@propietaria.com",
      phone: "+54 11 4444-1111",
    },
  });

  const properties = await Promise.all([
    prisma.property.create({
      data: {
        tenantId: tenant.id,
        address: "Av. Corrientes 1234, 4°B",
        type: "Departamento",
        city: "CABA",
        ownerId: owner.id,
      },
    }),
    prisma.property.create({
      data: {
        tenantId: tenant.id,
        address: "Calle Falsa 742",
        type: "Casa",
        city: "San Isidro",
        ownerId: owner.id,
      },
    }),
    prisma.property.create({
      data: {
        tenantId: tenant.id,
        address: "Bulevar Oroño 550, 2°A",
        type: "Departamento",
        city: "Rosario",
      },
    }),
  ]);

  const renters = await Promise.all([
    prisma.renter.create({
      data: { tenantId: tenant.id, name: "Juan Pérez", dni: "30111222", email: "juan@mail.com", phone: "+54 11 5555-0001" },
    }),
    prisma.renter.create({
      data: { tenantId: tenant.id, name: "Lucía Gómez", dni: "32444555", email: "lucia@mail.com", phone: "+54 11 5555-0002" },
    }),
    prisma.renter.create({
      data: { tenantId: tenant.id, name: "Carlos Sosa", dni: "28999888", email: "carlos@mail.com", phone: "+54 341 555-0003" },
    }),
  ]);

  const now = new Date();

  const contract1 = await prisma.contract.create({
    data: {
      tenantId: tenant.id,
      propertyId: properties[0].id,
      renterId: renters[0].id,
      startDate: subMonths(now, 10),
      endDate: addMonths(now, 26), // dentro de contrato largo
      rentAmount: 320000,
      adjustmentFrequencyMonths: 3,
      nextAdjustmentDate: addDays(now, 12), // próxima actualización cercana
      status: "ACTIVO",
    },
  });

  const contract2 = await prisma.contract.create({
    data: {
      tenantId: tenant.id,
      propertyId: properties[1].id,
      renterId: renters[1].id,
      startDate: subMonths(now, 22),
      endDate: addDays(now, 35), // vence pronto
      rentAmount: 410000,
      adjustmentFrequencyMonths: 6,
      nextAdjustmentDate: addMonths(now, 4),
      status: "ACTIVO",
    },
  });

  const contract3 = await prisma.contract.create({
    data: {
      tenantId: tenant.id,
      propertyId: properties[2].id,
      renterId: renters[2].id,
      startDate: subMonths(now, 4),
      endDate: addMonths(now, 20),
      rentAmount: 265000,
      adjustmentFrequencyMonths: 6,
      nextAdjustmentDate: addMonths(now, 2),
      status: "ACTIVO",
    },
  });

  await prisma.expense.createMany({
    data: [
      {
        tenantId: tenant.id,
        contractId: contract1.id,
        propertyId: properties[0].id,
        type: "ABL",
        description: "ABL 2do bimestre",
        amount: 18500,
        date: subMonths(now, 1),
      },
      {
        tenantId: tenant.id,
        contractId: contract1.id,
        propertyId: properties[0].id,
        type: "ARREGLO",
        description: "Reparación de canilla de cocina",
        amount: 12000,
        date: subMonths(now, 2),
      },
      {
        tenantId: tenant.id,
        contractId: contract2.id,
        propertyId: properties[1].id,
        type: "ARREGLO",
        description: "Pintura de living",
        amount: 45000,
        date: subMonths(now, 3),
      },
      {
        tenantId: tenant.id,
        contractId: contract2.id,
        propertyId: properties[1].id,
        type: "ABL",
        description: "ABL anual",
        amount: 52000,
        date: subMonths(now, 6),
      },
    ],
  });

  function period(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }

  // Contrato 1: pago del mes pasado pagado (con recibo generado) + mes actual pendiente
  const lastMonthDate = subMonths(now, 1);
  const paidDate = addDays(lastMonthDate, 5);
  const pdfBytes = await generateReceiptPdf({
    tenantName: tenant.name,
    receiptNumber: `DEMO-${period(lastMonthDate).replace("-", "")}-0001`,
    propertyAddress: properties[0].address,
    renterName: renters[0].name,
    renterDni: renters[0].dni,
    period: period(lastMonthDate),
    amount: contract1.rentAmount,
    paidDate,
  });

  await prisma.payment.create({
    data: {
      tenantId: tenant.id,
      contractId: contract1.id,
      period: period(lastMonthDate),
      amount: contract1.rentAmount,
      dueDate: addDays(lastMonthDate, 10),
      paidDate,
      status: "PAGADO",
      receiptFileName: `recibo-${period(lastMonthDate)}.pdf`,
      receiptFileData: `data:application/pdf;base64,${Buffer.from(pdfBytes).toString("base64")}`,
    },
  });

  await prisma.payment.create({
    data: {
      tenantId: tenant.id,
      contractId: contract1.id,
      period: period(now),
      amount: contract1.rentAmount,
      dueDate: addDays(now, 10),
      status: "PENDIENTE",
    },
  });

  await prisma.payment.create({
    data: {
      tenantId: tenant.id,
      contractId: contract2.id,
      period: period(now),
      amount: contract2.rentAmount,
      dueDate: addDays(now, 10),
      status: "PENDIENTE",
    },
  });

  await prisma.payment.create({
    data: {
      tenantId: tenant.id,
      contractId: contract3.id,
      period: period(subMonths(now, 1)),
      amount: contract3.rentAmount,
      dueDate: addDays(subMonths(now, 1), 10),
      paidDate: addDays(subMonths(now, 1), 3),
      status: "PAGADO",
    },
  });

  console.log("Seed completado:");
  console.log(`  Inmobiliaria: ${tenant.slug}`);
  console.log(`  Email: demo@inmobiliaria.com`);
  console.log(`  Password: demo1234`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
