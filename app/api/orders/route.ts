import { invoiceNumber } from "@/lib/format";
import { resourceHandlers } from "@/lib/resource-route";
import { notifyOrderCreated } from "@/lib/whatsapp";
import { salesOrderSchema } from "@/lib/validators";

const handlers = resourceHandlers({
  model: "salesOrder",
  searchFields: ["customerName", "whatsapp", "projectAddress", "item", "invoiceNumber", "deliveryStatus"],
  numericFields: ["quantity", "price"],
  exportFileName: "sales-order",
  exportFields: [
    { name: "invoiceNumber", label: "No Invoice" },
    { name: "customerName", label: "Nama Customer" },
    { name: "whatsapp", label: "Nomor WhatsApp" },
    { name: "projectAddress", label: "Alamat Proyek" },
    { name: "item", label: "Barang" },
    { name: "quantity", label: "Quantity", type: "number" },
    { name: "price", label: "Harga", type: "currency" },
    { name: "paymentStatus", label: "Status Pembayaran" },
    { name: "deliveryStatus", label: "Status Pengiriman" },
    { name: "orderStatus", label: "Status Order" },
    { name: "createdAt", label: "Tanggal Dibuat", type: "date" }
  ],
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
