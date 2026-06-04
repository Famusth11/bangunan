import { resourceHandlers } from "@/lib/resource-route";

const handlers = resourceHandlers({
  model: "worker",
  searchFields: ["name", "specialty", "area", "quality", "whatsapp"],
  exportFileName: "pekerja",
  exportFields: [
    { name: "name", label: "Nama" },
    { name: "specialty", label: "Keahlian" },
    { name: "area", label: "Area" },
    { name: "quality", label: "Kualitas" },
    { name: "whatsapp", label: "No WA" },
    { name: "createdAt", label: "Tanggal Dibuat", type: "date" }
  ],
  adminOnlyDelete: true
});

export const GET = handlers.GET;
export const POST = handlers.POST;
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
