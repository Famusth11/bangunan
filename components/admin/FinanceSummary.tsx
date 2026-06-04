"use client";

import { useEffect, useState } from "react";
import { ArrowDownCircle, ArrowUpCircle, BadgeDollarSign, CalendarDays, HandCoins, ReceiptText } from "lucide-react";
import { rupiah } from "@/lib/format";
import { MetricCard } from "@/components/admin/MetricCard";

type FinanceSummaryData = {
  month: string;
  income: number;
  expense: number;
  net: number;
  supplierDebt: number;
  customerReceivable: number;
  count: number;
};

export function FinanceSummary() {
  const [data, setData] = useState<FinanceSummaryData | null>(null);

  useEffect(() => {
    fetch("/api/finance/summary", { cache: "no-store" })
      .then((response) => response.json())
      .then(setData)
      .catch(() => setData(null));
  }, []);

  if (!data) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-28 animate-pulse rounded-lg border border-slate-200 bg-white shadow-soft dark:border-slate-700 dark:bg-slate-900" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-muted">
        <CalendarDays size={17} />
        Ringkasan bulan {data.month} dari {data.count} transaksi
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard title="Pemasukan Bulan Ini" value={rupiah(data.income)} icon={ArrowUpCircle} />
        <MetricCard title="Pengeluaran Bulan Ini" value={rupiah(data.expense)} icon={ArrowDownCircle} tone="accent" />
        <MetricCard title="Hasil Akhir" value={rupiah(data.net)} icon={BadgeDollarSign} tone="ink" />
        <MetricCard title="Hutang Supplier" value={rupiah(data.supplierDebt)} icon={ReceiptText} tone="accent" />
        <MetricCard title="Piutang Customer" value={rupiah(data.customerReceivable)} icon={HandCoins} />
      </div>
    </div>
  );
}
