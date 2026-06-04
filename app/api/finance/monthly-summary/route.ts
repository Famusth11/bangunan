import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api";

export async function GET(request: Request) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const url = new URL(request.url);
  const month = url.searchParams.get("month") ? Number(url.searchParams.get("month")) : new Date().getMonth();
  const year = url.searchParams.get("year") ? Number(url.searchParams.get("year")) : new Date().getFullYear();

  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 1);

  const records = await prisma.financeRecord.findMany({
    where: {
      recordDate: {
        gte: startOfMonth,
        lt: endOfMonth
      }
    },
    orderBy: { recordDate: "desc" }
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

  const groupedByType = {
    masuk: records.filter((r) => r.type === "MASUK"),
    keluar: records.filter((r) => r.type === "KELUAR" || r.type === "ONGKIR"),
    hutang: records.filter((r) => r.type === "HUTANG"),
    piutang: records.filter((r) => r.type === "PIUTANG")
  };

  return NextResponse.json({
    month: startOfMonth.toLocaleDateString("id-ID", { month: "long", year: "numeric" }),
    year,
    monthNumber: month,
    income,
    expense,
    net: income - expense,
    supplierDebt,
    customerReceivable,
    count: records.length,
    groupedByType,
    records: records.map((r) => ({
      id: r.id,
      title: r.title,
      type: r.type,
      amount: r.amount.toString(),
      projectName: r.projectName,
      recordDate: r.recordDate.toISOString().split("T")[0],
      note: r.note
    }))
  });
}
