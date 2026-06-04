import { ResourceManager } from "@/components/admin/ResourceManager";

const fields = [
  { name: "name", label: "Nama Stock Barang", required: true },
  { name: "description", label: "Keterangan", type: "textarea" as const, required: true },
  { name: "price", label: "Harga", type: "number" as const, required: true }
];

const columns = [
  { name: "name", label: "Nama Stock Barang" },
  { name: "description", label: "Keterangan" },
  { name: "price", label: "Harga", type: "number" as const }
];

export default function ProductsAdminPage() {
  return <ResourceManager title="Stock Barang" endpoint="/api/products" fields={fields} columns={columns} />;
}
