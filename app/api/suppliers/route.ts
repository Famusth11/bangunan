import { resourceHandlers } from "@/lib/resource-route";
import { supplierSchema } from "@/lib/validators";

const handlers = resourceHandlers({
  model: "supplier",
  searchFields: ["name", "salesContact", "area", "paymentTerm", "productType"],
  numericFields: ["latestPricelist"],
  exportFileName: "supplier",
  exportFields: [
    { name: "name", label: "Nama Supplier" },
    { name: "salesContact", label: "Kontak Sales" },
    { name: "area", label: "Area" },
    { name: "paymentTerm", label: "Tempo Pembayaran" },
    { name: "productType", label: "Jenis Barang" },
    { name: "latestPricelist", label: "Pricelist Terakhir", type: "currency" },
    { name: "createdAt", label: "Tanggal Dibuat", type: "date" }
  ],
  adminOnlyDelete: true,
  schema: supplierSchema
});

export const GET = handlers.GET;
export const POST = handlers.POST;
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
