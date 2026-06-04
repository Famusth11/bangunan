import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api";

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const start = new Date();
  start.setHours(0, 0, 0, 0);

  let todayOrders = 0;
  let runningProjects = 0;
  let unpaidOrders: any[] = [];
  let purchaseOrders: any[] = [];
  let financeRecords: any[] = [];
  let recentOrders: any[] = [];
  let deliveredOrders = 0;

  try {
    [todayOrders, runningProjects, unpaidOrders, purchaseOrders, financeRecords, recentOrders, deliveredOrders] = await Promise.all([
      prisma.salesOrder.count({ where: { createdAt: { gte: start } } }),
      prisma.salesOrder.count({ where: { orderStatus: "PROSES" } }),
      prisma.salesOrder.findMany({ where: { paymentStatus: "BELUM" }, take: 10 }),
      prisma.purchaseOrder.findMany({ where: { paymentStatus: "BELUM" }, take: 5, orderBy: { createdAt: "desc" } }),
      prisma.financeRecord.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.salesOrder.findMany({ take: 7, orderBy: { createdAt: "desc" } }),
      prisma.salesOrder.count({ where: { deliveryStatus: { contains: "Terkirim", mode: "insensitive" } } })
    ]);
  } catch (error) {
    console.error("Dashboard error:", error);
  }

  // Calculate metrics from real data
  const totalReceivable = unpaidOrders.reduce((sum, order) => sum + Number(order.price) * order.quantity, 0);
  const moneyIn = financeRecords.filter((item) => item.type === "MASUK").reduce((sum, item) => sum + Number(item.amount), 0);
  const moneyOut = financeRecords.filter((item) => item.type === "KELUAR").reduce((sum, item) => sum + Number(item.amount), 0);

  // Build chart data from recent orders
  const chartData = recentOrders.map((order) => ({
    name: order.createdAt.toLocaleDateString("id-ID", { day: "2-digit", month: "short" }),
    total: Number(order.price) * order.quantity
  }));

  // Build notifications
  const notifications = [
    ...unpaidOrders.slice(0, 3).map((order) => `Follow-up pembayaran ${order.customerName} - ${(Number(order.price) * order.quantity).toLocaleString("id-ID", { style: "currency", currency: "IDR" })}`),
    ...purchaseOrders.slice(0, 2).map((po) => `Cek ETA supplier ${po.supplierName}`)
  ];

  // If no data, show helpful notifications
  if (todayOrders === 0 && runningProjects === 0 && unpaidOrders.length === 0) {
    notifications.length = 0;
    notifications.push("Belum ada data order atau transaksi");
  }

  return NextResponse.json({
    metrics: {
      todayOrders,
      runningProjects,
      totalReceivable,
      delivery: `${deliveredOrders} terkirim`,
      supplierStock: `${purchaseOrders.length} PO perlu follow-up`,
      reminders: unpaidOrders.length
    },
    finance: { moneyIn, moneyOut, profit: moneyIn - moneyOut },
    chart: chartData.length > 0 ? chartData : [
      { name: "Senin", total: 0 },
      { name: "Selasa", total: 0 },
      { name: "Rabu", total: 0 },
      { name: "Kamis", total: 0 },
      { name: "Jumat", total: 0 }
    ],
    notifications
  });
}
