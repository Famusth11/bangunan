import { resourceHandlers } from "@/lib/resource-route";
import { projectSchema } from "@/lib/validators";

const handlers = resourceHandlers({
  model: "projectArchive",
  searchFields: ["title", "location", "material"],
  numericFields: ["projectValue"],
  booleanFields: ["isPublished"],
  exportFileName: "arsip-proyek",
  exportFields: [
    { name: "title", label: "Judul Proyek" },
    { name: "location", label: "Lokasi" },
    { name: "material", label: "Material" },
    { name: "projectValue", label: "Nilai Proyek", type: "currency" },
    { name: "isPublished", label: "Dipublikasikan", type: "boolean" },
    { name: "createdAt", label: "Tanggal Dibuat", type: "date" }
  ],
  adminOnlyDelete: true,
  schema: projectSchema
});

export const GET = handlers.GET;
export const POST = handlers.POST;
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
