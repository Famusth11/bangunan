import { resourceHandlers } from "@/lib/resource-route";
import { productSchema } from "@/lib/validators";

const handlers = resourceHandlers({
  model: "product",
  searchFields: ["name", "description"],
  numericFields: ["price"],
  booleanFields: ["isPromo"],
  exportFileName: "stock-barang",
  exportFields: [
    { name: "name", label: "Nama Stock Barang" },
    { name: "description", label: "Keterangan" },
    { name: "price", label: "Harga", type: "currency" },
    { name: "isPromo", label: "Promo", type: "boolean" },
    { name: "createdAt", label: "Tanggal Dibuat", type: "date" }
  ],
  adminOnlyDelete: true,
  schema: productSchema
});

export const GET = handlers.GET;
export const POST = handlers.POST;
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
