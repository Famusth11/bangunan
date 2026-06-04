import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api";

export async function GET() {
  const auth = await requireAuth(true);
  if (auth.error) return auth.error;

  const [
    users,
    salesOrders,
    purchaseOrders,
    customers,
    suppliers,
    financeRecords,
    workers,
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
    prisma.worker.findMany(),
    prisma.projectArchive.findMany(),
    prisma.product.findMany(),
    prisma.inquiry.findMany()
  ]);

  const backup = {
    generatedAt: new Date().toISOString(),
    app: "Bangunan Pro",
    version: "1.0.0",
    data: {
      users,
      salesOrders,
      purchaseOrders,
      customers,
      suppliers,
      financeRecords,
      workers,
      projectArchives,
      products,
      inquiries
    }
  };

  return new NextResponse(JSON.stringify(backup, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename=bangunan-backup-${new Date().toISOString().slice(0, 10)}.json`
    }
  });
}
