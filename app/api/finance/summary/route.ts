import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api";

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const records = await prisma.financeRecord.findMany({
    where: {
      recordDate: {
        gte: startOfMonth,
        lt: startOfNextMonth
      }
    }
  });

  const income = records
    .filter((record) => record.type === "MASUK")
    .reduce((sum, record) => sum + Number(record.amount), 0);

  const expense = records
    .filter((record) => record.type === "KELUAR" || record.type === "ONGKIR")
    .reduce((sum, record) => sum + Number(record.amount), 0);

  const supplierDebt = records
    .filter((record) => record.type === "HUTANG")
    .reduce((sum, record) => sum + Number(record.amount), 0);

  const customerReceivable = records
    .filter((record) => record.type === "PIUTANG")
    .reduce((sum, record) => sum + Number(record.amount), 0);

  return NextResponse.json({
    month: now.toLocaleDateString("id-ID", { month: "long", year: "numeric" }),
    income,
    expense,
    net: income - expense,
    supplierDebt,
    customerReceivable,
    count: records.length
  });
}
