import { ResourceManager } from "@/components/admin/ResourceManager";

const fields = [
  { name: "title", label: "Judul Proyek", required: true },
  { name: "location", label: "Lokasi", required: true },
  { name: "material", label: "Material", required: true },
  { name: "projectValue", label: "Nilai Proyek", type: "number" as const, required: true }
];

const columns = [
  { name: "title", label: "Judul Proyek" },
  { name: "location", label: "Lokasi" },
  { name: "material", label: "Material" },
  { name: "projectValue", label: "Nilai Proyek", type: "number" as const }
];

export default function ProjectsPage() {
  return <ResourceManager title="Arsip Proyek" endpoint="/api/projects" fields={fields} columns={columns} />;
}
