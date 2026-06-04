"use client";

import { useEffect, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Bell, CircleDollarSign, Clock, PackageCheck, Truck, UsersRound } from "lucide-react";
import { MetricCard } from "@/components/admin/MetricCard";
import { rupiah } from "@/lib/format";

type DashboardData = {
  metrics: {
    todayOrders: number;
    runningProjects: number;
    totalReceivable: number;
    delivery: string;
    supplierStock: string;
    reminders: number;
  };
  finance: { moneyIn: number; moneyOut: number; profit: number };
  chart: { name: string; total: number }[];
  notifications: string[];
};

export function DashboardClient() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard", { cache: "no-store" }).then((res) => res.json()).then(setData);
  }, []);

  if (!data) return <div className="rounded-lg bg-white p-6 shadow-soft">Memuat dashboard...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted">Ringkasan order, pengiriman, supplier, dan follow-up customer.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MetricCard title="Order Hari Ini" value={String(data.metrics.todayOrders)} icon={PackageCheck} />
        <MetricCard title="Proyek Berjalan" value={String(data.metrics.runningProjects)} icon={UsersRound} tone="accent" />
        <MetricCard title="Total Tagihan" value={rupiah(data.metrics.totalReceivable)} icon={CircleDollarSign} tone="ink" />
        <MetricCard title="Status Pengiriman" value={data.metrics.delivery} icon={Truck} />
        <MetricCard title="Stok Supplier Cepat" value={data.metrics.supplierStock} icon={Clock} tone="accent" />
        <MetricCard title="Reminder Follow-up" value={String(data.metrics.reminders)} icon={Bell} tone="ink" />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="mb-4 font-semibold">Grafik Penjualan</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.chart}>
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `${Number(value) / 1000000}jt`} />
                <Tooltip formatter={(value) => rupiah(Number(value))} />
                <Area type="monotone" dataKey="total" stroke="#0f8b8d" fill="#0f8b8d" fillOpacity={0.18} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="mb-4 font-semibold">Notifikasi</h2>
          <div className="space-y-3">
            {data.notifications.map((item) => (
              <div key={item} className="rounded-md bg-slate-50 px-3 py-2 text-sm">{item}</div>
            ))}
            {data.notifications.length === 0 && <p className="text-sm text-muted">Tidak ada notifikasi baru.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
