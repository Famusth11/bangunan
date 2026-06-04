import { NextResponse } from "next/server";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api";
import { rupiah } from "@/lib/format";

export const runtime = "nodejs";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { id } = await params;
  const order = await prisma.salesOrder.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ message: "Order tidak ditemukan" }, { status: 404 });

  const doc = new jsPDF();
  const total = Number(order.price) * order.quantity;

  doc.setFontSize(18);
  doc.text("INVOICE BANGUNAN PRO", 14, 18);
  doc.setFontSize(10);
  doc.text(`No: ${order.invoiceNumber}`, 14, 28);
  doc.text(`Tanggal: ${order.createdAt.toLocaleDateString("id-ID")}`, 14, 34);
  doc.text(`Customer: ${order.customerName}`, 14, 44);
  doc.text(`WhatsApp: ${order.whatsapp}`, 14, 50);
  doc.text(`Alamat Proyek: ${order.projectAddress}`, 14, 56);

  autoTable(doc, {
    startY: 66,
    head: [["Barang", "Qty", "Harga", "Total"]],
    body: [[order.item, order.quantity, rupiah(order.price.toString()), rupiah(total)]],
    styles: { fontSize: 10 },
    headStyles: { fillColor: [15, 139, 141] }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 12;
  doc.setFontSize(12);
  doc.text(`Status Pembayaran: ${order.paymentStatus}`, 14, finalY);
  doc.text(`Status Pengiriman: ${order.deliveryStatus}`, 14, finalY + 7);
  doc.setFontSize(14);
  doc.text(`TOTAL: ${rupiah(total)}`, 140, finalY + 7);

  const arrayBuffer = doc.output("arraybuffer");
  return new NextResponse(arrayBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename=${order.invoiceNumber}.pdf`
    }
  });
}
