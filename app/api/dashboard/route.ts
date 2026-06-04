import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api";

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const start = new Date();
  start.setHours(0, 0, 0, 0);

  let todayOrders;
  let runningProjects;
  let unpaidOrders;
  let purchaseOrders;
  let finance;
  let recentOrders;

  try {
    [todayOrders, runningProjects, unpaidOrders, purchaseOrders, finance, recentOrders] = await Promise.all([
      prisma.salesOrder.count({ where: { createdAt: { gte: start } } }),
      prisma.salesOrder.count({ where: { orderStatus: "PROSES" } }),
      prisma.salesOrder.findMany({ where: { paymentStatus: "BELUM" } }),
      prisma.purchaseOrder.findMany({ where: { paymentStatus: "BELUM" }, take: 5, orderBy: { createdAt: "desc" } }),
      prisma.financeRecord.findMany(),
      prisma.salesOrder.findMany({ take: 7, orderBy: { createdAt: "asc" } })
    ]);
  } catch {
    return NextResponse.json({
      metrics: {
        todayOrders: 2,
        runningProjects: 4,
        totalReceivable: 15750000,
        delivery: "3 terkirim",
        supplierStock: "2 PO perlu follow-up",
        reminders: 5
      },
      finance: { moneyIn: 25000000, moneyOut: 14200000, profit: 10800000 },
      chart: [
        { name: "Sen", total: 3500000 },
        { name: "Sel", total: 5200000 },
        { name: "Rab", total: 7800000 },
        { name: "Kam", total: 6400000 },
        { name: "Jum", total: 9100000 }
      ],
      notifications: [
        "Database belum terhubung",
        "Jalankan PostgreSQL, migrasi, dan seed untuk menggunakan data nyata",
        "Follow-up pembayaran contoh order Cluster Harmoni"
      ]
    });
  }

  const totalReceivable = unpaidOrders.reduce((sum, order) => sum + Number(order.price) * order.quantity, 0);
  const moneyIn = finance.filter((item) => item.type === "MASUK").reduce((sum, item) => sum + Number(item.amount), 0);
  const moneyOut = finance.filter((item) => item.type === "KELUAR").reduce((sum, item) => sum + Number(item.amount), 0);

  return NextResponse.json({
    metrics: {
      todayOrders,
      runningProjects,
      totalReceivable,
      delivery: `${await prisma.salesOrder.count({ where: { deliveryStatus: { contains: "Terkirim", mode: "insensitive" } } })} terkirim`,
      supplierStock: `${purchaseOrders.length} PO perlu follow-up`,
      reminders: unpaidOrders.length
    },
    finance: { moneyIn, moneyOut, profit: moneyIn - moneyOut },
    chart: recentOrders.map((order) => ({
      name: order.createdAt.toLocaleDateString("id-ID", { day: "2-digit", month: "short" }),
      total: Number(order.price) * order.quantity
    })),
    notifications: [
      ...unpaidOrders.slice(0, 3).map((order) => `Follow-up pembayaran ${order.customerName}`),
      ...purchaseOrders.slice(0, 2).map((po) => `Cek ETA supplier ${po.supplierName}`)
    ]
  });
}
