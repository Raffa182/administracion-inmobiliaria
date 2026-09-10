import bcrypt from "bcryptjs";
import { addDays, addMonths, subMonths, subDays } from "date-fns";
import { prisma } from "../src/lib/prisma";
import { generateReceiptPdf } from "../src/lib/receipt";

// Placeholders mínimos para simular archivos subidos en el seed.
const PLACEHOLDER_PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
const PLACEHOLDER_PDF_BYTES = Buffer.from(
  "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 200]>>endobj\ntrailer<</Root 1 0 R>>\n"
);
const PLACEHOLDER_PDF = `data:application/pdf;base64,${PLACEHOLDER_PDF_BYTES.toString("base64")}`;

async function main() {
  // Borrado explícito en orden de dependencias: SQLite no garantiza el
  // orden en que dispara varios triggers ON DELETE CASCADE sobre el mismo
  // padre (Tenant), y Contract -> Property/Renter es RESTRICT a propósito
  // (no se puede borrar una propiedad con contratos vigentes).
  const existing = { tenant: { slug: "demo" } };
  await prisma.payment.deleteMany({ where: existing });
  await prisma.personDocument.deleteMany({ where: existing });
  await prisma.propertyDocument.deleteMany({ where: existing });
  await prisma.propertyPhoto.deleteMany({ where: existing });
  await prisma.expense.deleteMany({ where: existing });
  await prisma.reservation.deleteMany({ where: existing });
  await prisma.contract.deleteMany({ where: existing });
  await prisma.sale.deleteMany({ where: existing });
  await prisma.property.deleteMany({ where: existing });
  await prisma.renter.deleteMany({ where: existing });
  await prisma.buyer.deleteMany({ where: existing });
  await prisma.owner.deleteMany({ where: existing });
  await prisma.user.deleteMany({ where: existing });
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
      phone: "+34 611 222 333",
    },
  });

  const properties = await Promise.all([
    prisma.property.create({
      data: {
        tenantId: tenant.id,
        address: "Calle Gran Vía 34, 4ºB",
        type: "Piso",
        city: "Madrid",
        ownerId: owner.id,
        listingType: "ALQUILER",
        squareMeters: 68,
        rooms: 2,
        petsAllowed: true,
        appliancesIncluded: true,
        furnished: true,
        hasParking: false,
        askingRent: 950,
      },
    }),
    prisma.property.create({
      data: {
        tenantId: tenant.id,
        address: "Carrer de Mallorca 401, 2ºA",
        type: "Ático",
        city: "Barcelona",
        ownerId: owner.id,
        listingType: "ALQUILER",
        squareMeters: 95,
        rooms: 3,
        petsAllowed: false,
        appliancesIncluded: true,
        furnished: false,
        hasParking: true,
        askingRent: 1250,
      },
    }),
    prisma.property.create({
      data: {
        tenantId: tenant.id,
        address: "Calle Mayor 12, Bajo",
        type: "Piso",
        city: "Valencia",
        listingType: "ALQUILER",
        squareMeters: 55,
        rooms: 1,
        petsAllowed: true,
        appliancesIncluded: false,
        furnished: false,
        hasParking: false,
        askingRent: 720,
      },
    }),
    prisma.property.create({
      data: {
        tenantId: tenant.id,
        address: "Calle Serrano 10, 5ºA",
        type: "Piso",
        city: "Madrid",
        ownerId: owner.id,
        listingType: "VENTA",
        squareMeters: 110,
        rooms: 3,
        hasParking: true,
        inUrbanizacion: false,
        askingSale: 285000,
      },
    }),
    prisma.property.create({
      data: {
        tenantId: tenant.id,
        address: "Calle Princesa 8, 1ºC",
        type: "Piso",
        city: "Madrid",
        listingType: "ALQUILER",
        squareMeters: 62,
        rooms: 2,
        petsAllowed: false,
        appliancesIncluded: true,
        furnished: true,
        askingRent: 680,
      },
    }),
  ]);

  const renters = await Promise.all([
    prisma.renter.create({
      data: { tenantId: tenant.id, name: "Juan Pérez", dni: "30111222W", email: "juan@mail.com", phone: "+34 611 234 567" },
    }),
    prisma.renter.create({
      data: { tenantId: tenant.id, name: "Lucía Gómez", dni: "32444555L", email: "lucia@mail.com", phone: "+34 622 345 678" },
    }),
    prisma.renter.create({
      data: { tenantId: tenant.id, name: "Carlos Sosa", dni: "28999888T", email: "carlos@mail.com", phone: "+34 633 456 789" },
    }),
    prisma.renter.create({
      data: { tenantId: tenant.id, name: "Elena Vidal", dni: "45678912B", email: "elena@mail.com", phone: "+34 644 567 890" },
    }),
  ]);

  const buyer = await prisma.buyer.create({
    data: {
      tenantId: tenant.id,
      name: "Pedro Ruiz",
      dni: "40111222X",
      email: "pedro@mail.com",
      phone: "+34 655 678 901",
    },
  });

  const now = new Date();

  const contract1 = await prisma.contract.create({
    data: {
      tenantId: tenant.id,
      propertyId: properties[0].id,
      renterId: renters[0].id,
      contractType: "LARGA_TEMPORADA",
      startDate: subMonths(now, 10),
      endDate: addMonths(now, 26), // dentro de contrato largo
      rentAmount: 950,
      adjustmentFrequencyMonths: 12,
      nextAdjustmentDate: addDays(now, 12), // próxima actualización cercana
      status: "ACTIVO",
    },
  });

  const contract2 = await prisma.contract.create({
    data: {
      tenantId: tenant.id,
      propertyId: properties[1].id,
      renterId: renters[1].id,
      contractType: "TEMPORADA",
      startDate: subMonths(now, 22),
      endDate: addDays(now, 35), // vence pronto
      rentAmount: 1250,
      adjustmentFrequencyMonths: 12,
      nextAdjustmentDate: addMonths(now, 4),
      status: "ACTIVO",
    },
  });

  const contract3 = await prisma.contract.create({
    data: {
      tenantId: tenant.id,
      propertyId: properties[2].id,
      renterId: renters[2].id,
      contractType: "LARGA_TEMPORADA",
      startDate: subMonths(now, 4),
      endDate: addMonths(now, 20),
      rentAmount: 720,
      adjustmentFrequencyMonths: 12,
      nextAdjustmentDate: addMonths(now, 8),
      status: "ACTIVO",
    },
  });

  // Reserva activa (todavía no convertida en contrato)
  await prisma.reservation.create({
    data: {
      tenantId: tenant.id,
      propertyId: properties[4].id,
      renterId: renters[3].id,
      reservationDate: subDays(now, 3),
      amount: 680,
      status: "ACTIVA",
      notes: "Entrega de llaves pendiente de firma de contrato.",
    },
  });

  // Venta en curso, con comprador ya asignado
  await prisma.sale.create({
    data: {
      tenantId: tenant.id,
      propertyId: properties[3].id,
      buyerId: buyer.id,
      price: 280000,
      status: "RESERVADA",
      notes: "A la espera de la firma ante notario.",
    },
  });

  await prisma.expense.createMany({
    data: [
      {
        tenantId: tenant.id,
        contractId: contract1.id,
        propertyId: properties[0].id,
        type: "IBI",
        description: "IBI anual",
        amount: 340,
        date: subMonths(now, 1),
      },
      {
        tenantId: tenant.id,
        contractId: contract1.id,
        propertyId: properties[0].id,
        type: "ARREGLO",
        description: "Reparación de grifo de cocina",
        amount: 85,
        date: subMonths(now, 2),
      },
      {
        tenantId: tenant.id,
        contractId: contract2.id,
        propertyId: properties[1].id,
        type: "ARREGLO",
        description: "Pintura del salón",
        amount: 320,
        date: subMonths(now, 3),
      },
      {
        tenantId: tenant.id,
        contractId: contract2.id,
        propertyId: properties[1].id,
        type: "COMUNIDAD",
        description: "Cuota de comunidad (trimestral)",
        amount: 180,
        date: subMonths(now, 6),
      },
      // Gastos de la propiedad en venta, sin contrato asociado
      {
        tenantId: tenant.id,
        propertyId: properties[3].id,
        type: "IBI",
        description: "IBI anual",
        amount: 410,
        date: subMonths(now, 2),
        receiptFileName: "recibo-ibi.pdf",
        receiptFileData: PLACEHOLDER_PDF,
      },
      {
        tenantId: tenant.id,
        propertyId: properties[3].id,
        type: "BASURA",
        description: "Tasa de basuras anual",
        amount: 95,
        date: subMonths(now, 2),
        receiptFileName: "recibo-basura.pdf",
        receiptFileData: PLACEHOLDER_PDF,
      },
    ],
  });

  // Documentación de ejemplo: propiedad en venta, inquilino y comprador
  await prisma.propertyDocument.create({
    data: {
      tenantId: tenant.id,
      propertyId: properties[3].id,
      type: "ESCRITURA",
      fileName: "escritura-serrano-10.pdf",
      fileData: PLACEHOLDER_PDF,
    },
  });

  await prisma.propertyPhoto.createMany({
    data: [
      {
        tenantId: tenant.id,
        propertyId: properties[0].id,
        type: "PROPIEDAD",
        fileName: "salon.png",
        fileData: PLACEHOLDER_PNG,
      },
      {
        tenantId: tenant.id,
        propertyId: properties[0].id,
        type: "LLAVE",
        label: "Llave puerta principal",
        fileName: "llave-principal.png",
        fileData: PLACEHOLDER_PNG,
      },
    ],
  });

  await prisma.personDocument.createMany({
    data: [
      {
        tenantId: tenant.id,
        renterId: renters[0].id,
        type: "DNI",
        fileName: "dni-juan-perez.pdf",
        fileData: PLACEHOLDER_PDF,
      },
      {
        tenantId: tenant.id,
        renterId: renters[0].id,
        type: "NOMINA",
        fileName: "nomina-juan-perez.pdf",
        fileData: PLACEHOLDER_PDF,
      },
      {
        tenantId: tenant.id,
        buyerId: buyer.id,
        type: "DNI",
        fileName: "dni-pedro-ruiz.pdf",
        fileData: PLACEHOLDER_PDF,
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
