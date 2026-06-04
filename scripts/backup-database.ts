import { loadEnvConfig } from "@next/env";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { prisma } from "../lib/prisma";

loadEnvConfig(process.cwd());

async function main() {
  const [
    users,
    salesOrders,
    purchaseOrders,
    customers,
    suppliers,
    financeRecords,
    projectArchives,
    products,
    inquiries
  ] = await Promise.all([
    prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true } }),
    prisma.salesOrder.findMany(),
    prisma.purchaseOrder.findMany(),
    prisma.customer.findMany(),
    prisma.supplier.findMany(),
    prisma.financeRecord.findMany(),
    prisma.projectArchive.findMany(),
    prisma.product.findMany(),
    prisma.inquiry.findMany()
  ]);

  const backup = {
    generatedAt: new Date().toISOString(),
    app: "Bangunan Pro",
    data: {
      users,
      salesOrders,
      purchaseOrders,
      customers,
      suppliers,
      financeRecords,
      projectArchives,
      products,
      inquiries
    }
  };

  const dir = path.join(process.cwd(), "backups");
  await mkdir(dir, { recursive: true });
  const file = path.join(dir, `bangunan-backup-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  await writeFile(file, JSON.stringify(backup, null, 2), "utf8");
  console.log(`Backup tersimpan: ${file}`);
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
