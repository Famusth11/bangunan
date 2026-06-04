import { invoiceNumber } from "@/lib/format";
import { resourceHandlers } from "@/lib/resource-route";
import { notifyOrderCreated } from "@/lib/whatsapp";
import { salesOrderSchema } from "@/lib/validators";

const handlers = resourceHandlers({
  model: "salesOrder",
  searchFields: ["customerName", "whatsapp", "projectAddress", "item", "invoiceNumber", "deliveryStatus"],
  numericFields: ["quantity", "price"],
  adminOnlyDelete: true,
  schema: salesOrderSchema,
  defaults: (data) => ({ invoiceNumber: data.invoiceNumber || invoiceNumber(), ...data }),
  afterCreate: async (order) => {
    await notifyOrderCreated({
      invoiceNumber: order.invoiceNumber,
      customerName: order.customerName,
      whatsapp: order.whatsapp,
      item: order.item,
      quantity: order.quantity,
      price: order.price
    });
  }
});

export const GET = handlers.GET;
export const POST = handlers.POST;
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
