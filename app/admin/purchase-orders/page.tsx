import { ResourceManager } from "@/components/admin/ResourceManager";

const fields = [
  { name: "supplierName", label: "Nama Supplier", required: true },
  { name: "item", label: "Barang", required: true },
  { name: "costPrice", label: "Harga Modal", type: "number" as const, required: true },
  { name: "shippingCost", label: "Ongkir", type: "number" as const },
  { name: "eta", label: "Estimasi Tiba", type: "date" as const },
  { name: "paymentStatus", label: "Status Pembayaran", type: "select" as const, options: ["LUNAS", "BELUM"], required: true }
];

export default function PurchaseOrdersPage() {
  return <ResourceManager title="Purchasing Order Supplier" endpoint="/api/purchase-orders" fields={fields} columns={fields} />;
}
