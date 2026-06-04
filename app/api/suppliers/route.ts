import { resourceHandlers } from "@/lib/resource-route";
import { supplierSchema } from "@/lib/validators";

const handlers = resourceHandlers({
  model: "supplier",
  searchFields: ["name", "salesContact", "area", "paymentTerm", "productType"],
  numericFields: ["latestPricelist"],
  adminOnlyDelete: true,
  schema: supplierSchema
});

export const GET = handlers.GET;
export const POST = handlers.POST;
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
