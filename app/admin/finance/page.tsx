import { ResourceManager } from "@/components/admin/ResourceManager";
import { FinanceSummary } from "@/components/admin/FinanceSummary";

//const today = new Date().toISOString().split('T')[0];

const fields = [
  { name: "title", label: "Judul", required: true },
  { name: "type", label: "Tipe", type: "select" as const, options: ["MASUK", "KELUAR", "HUTANG", "PIUTANG", "ONGKIR"], required: true },
  { name: "amount", label: "Nominal", type: "number" as const, required: true },
  { name: "projectName", label: "Nama Proyek" },
  { name: "recordDate", label: "Tanggal", type: "date" as const },
  { name: "note", label: "Catatan", type: "textarea" as const }
];

export default function FinancePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Keuangan</h1>
        <p className="text-sm text-muted">Kelola transaksi keuangan dan lihat ringkasan keuangan hari ini.</p>
      </div>

      <div>
        <h2 className="mb-4 text-xl font-semibold">Ringkasan Bulan Ini</h2>
        <FinanceSummary />
      </div>

      <div>
        <ResourceManager title="Data Transaksi" endpoint="/api/finance" fields={fields} columns={fields} />
      </div>
    </div>
  );
}
