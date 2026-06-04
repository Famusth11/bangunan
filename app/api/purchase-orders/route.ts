import { resourceHandlers } from "@/lib/resource-route";
import { purchaseOrderSchema } from "@/lib/validators";

const handlers = resourceHandlers({
  model: "purchaseOrder",
  searchFields: ["supplierName", "item"],
  numericFields: ["costPrice", "shippingCost"],
  dateFields: ["eta"],
  exportFileName: "purchase-order",
  exportFields: [
    { name: "supplierName", label: "Nama Supplier" },
    { name: "item", label: "Barang" },
    { name: "costPrice", label: "Harga Modal", type: "currency" },
    { name: "shippingCost", label: "Ongkir", type: "currency" },
    { name: "eta", label: "Estimasi Tiba", type: "date" },
    { name: "paymentStatus", label: "Status Pembayaran" },
    { name: "createdAt", label: "Tanggal Dibuat", type: "date" }
  ],
  adminOnlyDelete: true,
  schema: purchaseOrderSchema
});

export const GET = handlers.GET;
export const POST = handlers.POST;
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
