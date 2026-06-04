import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

loadEnvConfig(process.cwd());

const prisma = new PrismaClient();

async function main() {
  const adminName = process.env.SEED_ADMIN_NAME || "Admin Utama";
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@bangunan.local";
  const adminPlainPassword = process.env.SEED_ADMIN_PASSWORD || "admin12345";
  const seedSampleData = process.env.SEED_SAMPLE_DATA !== "false";

  if (adminPlainPassword.length < 8) {
    throw new Error("SEED_ADMIN_PASSWORD minimal 8 karakter");
  }

  const adminPassword = await bcrypt.hash(adminPlainPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { name: adminName, passwordHash: adminPassword, role: "ADMIN" },
    create: { name: adminName, email: adminEmail, passwordHash: adminPassword, role: "ADMIN" }
  });

  if (!seedSampleData) return;

  if ((await prisma.salesOrder.count()) > 0) return;

  const customer = await prisma.customer.create({
    data: { name: "Budi Santoso", whatsapp: "6281211112222", address: "Jl. Merdeka No. 10", category: "KONTRAKTOR" }
  });

  const supplier = await prisma.supplier.create({
    data: {
      name: "PT Sumber Baja Ringan",
      salesContact: "Rina - 6281299990000",
      area: "Jabodetabek",
      paymentTerm: "Tempo 14 hari",
      productType: "Baja ringan, hollow, reng",
      latestPricelist: 87500
    }
  });

  await prisma.salesOrder.createMany({
    data: [
      {
        invoiceNumber: "INV-20260527-001",
        customerName: customer.name,
        whatsapp: customer.whatsapp,
        projectAddress: "Cluster Harmoni Blok A2",
        item: "Baja ringan C75",
        quantity: 120,
        price: 87500,
        paymentStatus: "BELUM",
        deliveryStatus: "Dijadwalkan",
        orderStatus: "PROSES",
        customerId: customer.id
      },
      {
        invoiceNumber: "INV-20260527-002",
        customerName: "CV Karya Plafon",
        whatsapp: "6281312348888",
        projectAddress: "Ruko Grand Niaga",
        item: "Gypsum board 9mm",
        quantity: 80,
        price: 68500,
        paymentStatus: "LUNAS",
        deliveryStatus: "Terkirim",
        orderStatus: "SELESAI"
      }
    ]
  });

  await prisma.purchaseOrder.create({
    data: {
      supplierName: supplier.name,
      item: "Baja ringan C75",
      costPrice: 76000,
      shippingCost: 350000,
      eta: new Date("2026-05-29"),
      paymentStatus: "BELUM",
      supplierId: supplier.id
    }
  });

  await prisma.financeRecord.createMany({
    data: [
      { title: "DP proyek Harmoni", type: "MASUK", amount: 3500000, projectName: "Cluster Harmoni" },
      { title: "Pembelian stok baja ringan", type: "KELUAR", amount: 9120000, projectName: "Cluster Harmoni" },
      { title: "Piutang CV Karya Plafon", type: "PIUTANG", amount: 2250000, projectName: "Ruko Grand Niaga" }
    ]
  });

  await prisma.worker.createMany({
    data: [
      { name: "Asep", specialty: "Baja ringan", area: "Bekasi", quality: "A", whatsapp: "6281287654321" },
      { name: "Dedi", specialty: "Plafon gypsum", area: "Jakarta Timur", quality: "B+", whatsapp: "6281399991111" }
    ]
  });

  await prisma.product.createMany({
    data: [
      { name: "Baja Ringan C75", description: "Material rangka atap premium untuk proyek rumah dan ruko.", price: 87500 },
      { name: "Gypsum Board 9mm", description: "Papan gypsum rapi untuk plafon dan partisi interior.", price: 68500 }
    ]
  });

  await prisma.projectArchive.create({
    data: {
      title: "Renovasi Atap Cluster Harmoni",
      location: "Bekasi",
      material: "Baja ringan C75, reng, genteng metal",
      projectValue: 18500000,
      isPublished: true
    }
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
