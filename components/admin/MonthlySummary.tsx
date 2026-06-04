"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ArrowDownCircle, ArrowUpCircle, BadgeDollarSign, ReceiptText, HandCoins, Download } from "lucide-react";
import { rupiah } from "@/lib/format";
import { MetricCard } from "@/components/admin/MetricCard";

type MonthlySummaryData = {
  month: string;
  year: number;
  monthNumber: number;
  income: number;
  expense: number;
  net: number;
  supplierDebt: number;
  customerReceivable: number;
  count: number;
  records: Array<{
    id: string;
    title: string;
    type: string;
    amount: string;
    projectName: string | null;
    recordDate: string;
    note: string | null;
  }>;
};

export function MonthlySummary() {
  const [data, setData] = useState<MonthlySummaryData | null>(null);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    load();
  }, [month, year]);

  async function load() {
    setLoading(true);
    try {
      const response = await fetch(`/api/finance/monthly-summary?month=${month}&year=${year}`, { cache: "no-store" });
      const result = await response.json();
      setData(result);
    } catch {
      setData(null);
    }
    setLoading(false);
  }

  function prevMonth() {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  }

  function nextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  }

  const monthName = new Date(year, month, 1).toLocaleDateString("id-ID", { month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Rekapan Bulanan</h1>
          <p className="text-sm text-muted">Lihat ringkasan keuangan untuk bulan yang dipilih.</p>
        </div>
        <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white">
          <Download size={16} />
          Cetak
        </button>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4">
        <button onClick={prevMonth} disabled={loading} className="rounded-md border border-slate-200 p-2 hover:bg-slate-50 disabled:opacity-40">
          <ChevronLeft size={20} />
        </button>
        <div className="flex flex-col items-center">
          <p className="text-lg font-semibold">{monthName}</p>
          <p className="text-xs text-muted">{data?.count ?? 0} transaksi</p>
        </div>
        <button onClick={nextMonth} disabled={loading} className="rounded-md border border-slate-200 p-2 hover:bg-slate-50 disabled:opacity-40">
          <ChevronRight size={20} />
        </button>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-lg border border-slate-200 bg-white shadow-soft" />
          ))}
        </div>
      ) : data ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <MetricCard title="Pemasukan" value={rupiah(data.income)} icon={ArrowUpCircle} />
            <MetricCard title="Pengeluaran" value={rupiah(data.expense)} icon={ArrowDownCircle} tone="accent" />
            <MetricCard title="Hasil Akhir" value={rupiah(data.net)} icon={BadgeDollarSign} tone={data.net >= 0 ? "ink" : "accent"} />
            <MetricCard title="Hutang Supplier" value={rupiah(data.supplierDebt)} icon={ReceiptText} tone="accent" />
            <MetricCard title="Piutang Customer" value={rupiah(data.customerReceivable)} icon={HandCoins} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
              <h3 className="mb-4 font-semibold">Pemasukan</h3>
              <div className="space-y-2">
                {data.records
                  .filter((r) => r.type === "MASUK")
                  .map((record) => (
                    <div key={record.id} className="flex items-center justify-between border-b border-slate-100 py-2">
                      <div className="flex-1">
                        <p className="font-medium">{record.title}</p>
                        {record.projectName && <p className="text-xs text-muted">{record.projectName}</p>}
                      </div>
                      <p className="font-semibold text-green-600">{rupiah(record.amount)}</p>
                    </div>
                  ))}
                {data.records.filter((r) => r.type === "MASUK").length === 0 && <p className="text-sm text-muted">Tidak ada pemasukan</p>}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
              <h3 className="mb-4 font-semibold">Pengeluaran</h3>
              <div className="space-y-2">
                {data.records
                  .filter((r) => r.type === "KELUAR" || r.type === "ONGKIR")
                  .map((record) => (
                    <div key={record.id} className="flex items-center justify-between border-b border-slate-100 py-2">
                      <div className="flex-1">
                        <p className="font-medium">{record.title}</p>
                        {record.projectName && <p className="text-xs text-muted">{record.projectName}</p>}
                      </div>
                      <p className="font-semibold text-red-600">{rupiah(record.amount)}</p>
                    </div>
                  ))}
                {data.records.filter((r) => r.type === "KELUAR" || r.type === "ONGKIR").length === 0 && <p className="text-sm text-muted">Tidak ada pengeluaran</p>}
              </div>
            </div>
          </div>

          {(data.records.filter((r) => r.type === "HUTANG" || r.type === "PIUTANG").length > 0) && (
            <div className="grid gap-6 lg:grid-cols-2">
              {data.records.filter((r) => r.type === "HUTANG").length > 0 && (
                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
                  <h3 className="mb-4 font-semibold">Hutang Supplier</h3>
                  <div className="space-y-2">
                    {data.records
                      .filter((r) => r.type === "HUTANG")
                      .map((record) => (
                        <div key={record.id} className="flex items-center justify-between border-b border-slate-100 py-2">
                          <div className="flex-1">
                            <p className="font-medium">{record.title}</p>
                            {record.projectName && <p className="text-xs text-muted">{record.projectName}</p>}
                          </div>
                          <p className="font-semibold text-yellow-600">{rupiah(record.amount)}</p>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {data.records.filter((r) => r.type === "PIUTANG").length > 0 && (
                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
                  <h3 className="mb-4 font-semibold">Piutang Customer</h3>
                  <div className="space-y-2">
                    {data.records
                      .filter((r) => r.type === "PIUTANG")
                      .map((record) => (
                        <div key={record.id} className="flex items-center justify-between border-b border-slate-100 py-2">
                          <div className="flex-1">
                            <p className="font-medium">{record.title}</p>
                            {record.projectName && <p className="text-xs text-muted">{record.projectName}</p>}
                          </div>
                          <p className="font-semibold text-blue-600">{rupiah(record.amount)}</p>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
