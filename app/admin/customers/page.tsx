import { ResourceManager } from "@/components/admin/ResourceManager";

const fields = [
  { name: "name", label: "Nama", required: true },
  { name: "whatsapp", label: "No WA", required: true },
  { name: "address", label: "Alamat", type: "textarea" as const, required: true },
  { name: "category", label: "Kategori", type: "select" as const, options: ["RETAIL", "TUKANG", "APLIKATOR", "KONTRAKTOR", "MANDOR"], required: true }
];

export default function CustomersPage() {
  return <ResourceManager title="Database Customer" endpoint="/api/customers" fields={fields} columns={fields} />;
}
