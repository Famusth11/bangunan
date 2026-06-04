import { resourceHandlers } from "@/lib/resource-route";
import { financeSchema } from "@/lib/validators";

const handlers = resourceHandlers({
  model: "financeRecord",
  searchFields: ["title", "type", "projectName", "note"],
  numericFields: ["amount"],
  dateFields: ["recordDate"],
  adminOnlyDelete: true,
  schema: financeSchema
});

export const GET = handlers.GET;
export const POST = handlers.POST;
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
