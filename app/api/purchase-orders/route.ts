import { resourceHandlers } from "@/lib/resource-route";
import { purchaseOrderSchema } from "@/lib/validators";

const handlers = resourceHandlers({
  model: "purchaseOrder",
  searchFields: ["supplierName", "item"],
  numericFields: ["costPrice", "shippingCost"],
  dateFields: ["eta"],
  adminOnlyDelete: true,
  schema: purchaseOrderSchema
});

export const GET = handlers.GET;
export const POST = handlers.POST;
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
