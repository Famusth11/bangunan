import { rupiah, waLink } from "@/lib/format";

type OrderNotification = {
  invoiceNumber: string;
  customerName: string;
  whatsapp: string;
  item: string;
  quantity: number;
  price: number | string;
};

export async function notifyOrderCreated(order: OrderNotification) {
  const webhookUrl = process.env.WHATSAPP_WEBHOOK_URL;
  if (!webhookUrl) return { sent: false, reason: "WHATSAPP_WEBHOOK_URL kosong" };

  const total = Number(order.price) * order.quantity;
  const message = [
    "Order baru masuk",
    `Invoice: ${order.invoiceNumber}`,
    `Customer: ${order.customerName}`,
    `WA: ${order.whatsapp}`,
    `Barang: ${order.item}`,
    `Qty: ${order.quantity}`,
    `Total: ${rupiah(total)}`,
    `Chat customer: ${waLink(order.whatsapp, `Halo ${order.customerName}, order ${order.invoiceNumber} sudah kami terima.`)}`
  ].join("\n");

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.WHATSAPP_WEBHOOK_TOKEN ? { Authorization: `Bearer ${process.env.WHATSAPP_WEBHOOK_TOKEN}` } : {})
      },
      body: JSON.stringify({
        to: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
        message,
        order
      })
    });

    return { sent: response.ok, status: response.status };
  } catch (error) {
    console.error("WhatsApp notification failed", error);
    return { sent: false, reason: "Webhook gagal dipanggil" };
  }
}
