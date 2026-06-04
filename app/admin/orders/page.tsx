import { ResourceManager } from "@/components/admin/ResourceManager";

const fields = [
  { name: "customerName", label: "Nama Customer", required: true },
  { name: "whatsapp", label: "Nomor WhatsApp", required: true },
  { name: "projectAddress", label: "Alamat Proyek", type: "textarea" as const, required: true },
  { name: "item", label: "Barang", required: true },
  { name: "quantity", label: "Quantity", type: "number" as const, required: true },
  { name: "price", label: "Harga", type: "number" as const, required: true },
  { name: "paymentStatus", label: "Status Pembayaran", type: "select" as const, options: ["LUNAS", "BELUM"], required: true },
  { name: "deliveryStatus", label: "Status Pengiriman", required: true },
  { name: "orderStatus", label: "Status Order", type: "select" as const, options: ["PENDING", "PROSES", "SELESAI"], required: true }
];

export default function OrdersPage() {
  return <ResourceManager title="Sales Order" endpoint="/api/orders" fields={fields} columns={fields} invoice />;
}
