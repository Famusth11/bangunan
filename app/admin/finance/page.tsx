import { ResourceManager } from "@/components/admin/ResourceManager";
import { FinanceSummary } from "@/components/admin/FinanceSummary";

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
    <div className="space-y-6">
      <FinanceSummary />
      <ResourceManager title="Keuangan" endpoint="/api/finance" fields={fields} columns={fields} />
    </div>
  );
}
