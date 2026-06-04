import { resourceHandlers } from "@/lib/resource-route";
import { customerSchema } from "@/lib/validators";

const handlers = resourceHandlers({
  model: "customer",
  searchFields: ["name", "whatsapp", "address", "category"],
  exportFileName: "customer",
  exportFields: [
    { name: "name", label: "Nama" },
    { name: "whatsapp", label: "No WA" },
    { name: "address", label: "Alamat" },
    { name: "category", label: "Kategori" },
    { name: "createdAt", label: "Tanggal Dibuat", type: "date" }
  ],
  adminOnlyDelete: true,
  schema: customerSchema
});

export const GET = handlers.GET;
export const POST = handlers.POST;
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
