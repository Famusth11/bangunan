import { resourceHandlers } from "@/lib/resource-route";
import { productSchema } from "@/lib/validators";

const handlers = resourceHandlers({
  model: "product",
  searchFields: ["name", "description"],
  numericFields: ["price"],
  booleanFields: ["isPromo"],
  adminOnlyDelete: true,
  schema: productSchema
});

export const GET = handlers.GET;
export const POST = handlers.POST;
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
