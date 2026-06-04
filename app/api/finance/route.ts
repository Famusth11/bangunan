import { resourceHandlers } from "@/lib/resource-route";
import { financeSchema } from "@/lib/validators";

const handlers = resourceHandlers({
  model: "financeRecord",
  searchFields: ["title", "type", "projectName", "note"],
  numericFields: ["amount"],
  dateFields: ["recordDate"],
  exportFileName: "keuangan",
  exportFields: [
    { name: "title", label: "Judul" },
    { name: "type", label: "Tipe" },
    { name: "amount", label: "Nominal", type: "currency" },
    { name: "projectName", label: "Nama Proyek" },
    { name: "recordDate", label: "Tanggal", type: "date" },
    { name: "note", label: "Catatan" },
    { name: "createdAt", label: "Tanggal Dibuat", type: "date" }
  ],
  adminOnlyDelete: true,
  schema: financeSchema
});

export const GET = handlers.GET;
export const POST = handlers.POST;
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
