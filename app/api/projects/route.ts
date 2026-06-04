import { resourceHandlers } from "@/lib/resource-route";
import { projectSchema } from "@/lib/validators";

const handlers = resourceHandlers({
  model: "projectArchive",
  searchFields: ["title", "location", "material"],
  numericFields: ["projectValue"],
  booleanFields: ["isPublished"],
  adminOnlyDelete: true,
  schema: projectSchema
});

export const GET = handlers.GET;
export const POST = handlers.POST;
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
