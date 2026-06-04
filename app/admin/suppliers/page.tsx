import { ResourceManager } from "@/components/admin/ResourceManager";

const fields = [
  { name: "name", label: "Nama Supplier", required: true },
  { name: "salesContact", label: "Kontak Sales", required: true },
  { name: "area", label: "Area", required: true },
  { name: "paymentTerm", label: "Tempo Pembayaran", required: true },
  { name: "productType", label: "Jenis Barang", required: true },
  { name: "latestPricelist", label: "Pricelist Terakhir", type: "number" as const, required: true }
];

export default function SuppliersPage() {
  return <ResourceManager title="Database Supplier" endpoint="/api/suppliers" fields={fields} columns={fields} />;
}
