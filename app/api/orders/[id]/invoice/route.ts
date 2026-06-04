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
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const total = Number(order.price) * order.quantity;
  const margin = 14;
  const rightColumn = pageWidth - margin - 50;

  // Header - Company Info (Left)
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("BANGUNAWAR", margin, 15);
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Karangnangka RT 02 RW 01", margin, 21);
  doc.text("089525626994", margin, 26);
  doc.text("wildanpowel@gmail.com", margin, 31);

  // Header - FAKTUR (Right)
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("FAKTUR", rightColumn + 5, 18);
  
  // Invoice Number and Date (Right)
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`#${order.invoiceNumber}`, rightColumn + 5, 28);
  doc.text(`Tanggal: ${order.createdAt.toLocaleDateString("id-ID")}`, rightColumn + 5, 34);

  // "Tagih Kepada:" section (Left)
  let yPos = 44;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Tagih Kepada: " + order.customerName, margin, yPos);
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  yPos += 5;
  doc.text(order.projectAddress, margin, yPos);
  yPos += 5;
  doc.text(order.whatsapp, margin, yPos);

  // Items Table
  yPos += 8;
  autoTable(doc, {
    startY: yPos,
    head: [["#", "Item", "Satuan", "Kuantitas", "Biaya satuan", "Total"]],
    body: [
      ["1", order.item, "Meter", order.quantity.toString(), rupiah(order.price.toString()), rupiah(total.toString())]
    ],
    columnStyles: {
      0: { cellWidth: 8, halign: "center" },
      1: { cellWidth: 50 },
      2: { cellWidth: 20, halign: "center" },
      3: { cellWidth: 20, halign: "center" },
      4: { cellWidth: 30, halign: "right" },
      5: { cellWidth: 32, halign: "right" }
    },
    styles: { 
      fontSize: 9,
      cellPadding: 3,
      textColor: [0, 0, 0]
    },
    headStyles: { 
      fillColor: [220, 220, 220],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      fontSize: 9
    },
    margin: { left: margin, right: margin }
  });

  // Subtotal and Total
  yPos = (doc as any).lastAutoTable.finalY + 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  // Subtotal
  const subtotalX = pageWidth - margin - 70;
  doc.text("Subtotal", subtotalX, yPos);
  doc.text(rupiah(total.toString()), pageWidth - margin - 2, yPos, { align: "right" });
  
  // Line separator
  yPos += 4;
  doc.setDrawColor(180);
  doc.setLineWidth(0.5);
  doc.line(subtotalX, yPos, pageWidth - margin, yPos);
  
  // Total
  yPos += 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Total", subtotalX, yPos);
  doc.text(rupiah(total.toString()), pageWidth - margin - 2, yPos, { align: "right" });

  // Signature section
  yPos += 15;
  
  // Signature area (Right side)
  const signatureX = pageWidth - margin - 55;
  
  // Payment Status stamp (positioned at signature area)
  doc.setFontSize(16);
  const isLunas = order.paymentStatus === "LUNAS";
  if (isLunas) {
    doc.setTextColor(100, 180, 100);
    doc.text("LUNAS", signatureX - 5, yPos + 8, { angle: -20 });
  } else {
    doc.setTextColor(220, 100, 100);
    doc.setFontSize(14);
    doc.text("BELUM LUNAS", signatureX - 10, yPos + 8, { angle: -20 });
  }
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  
  // Signature line
  yPos += 20;
  doc.setFontSize(9);
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.line(signatureX, yPos, pageWidth - margin - 5, yPos);
  
  // Simple signature representation (curved lines)
  doc.setLineWidth(0.3);
  doc.setTextColor(80, 80, 80);
  // Draw a simple signature-like mark
  const sigStartX = signatureX + 5;
  const sigY = yPos - 8;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(12);
  doc.text("Wildan", sigStartX, sigY);
  
  // Signer name and date
  doc.setFont(undefined, "bold");
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  yPos += 4;
  doc.text("M Wildan Munawar", signatureX, yPos);
  yPos += 5;
  doc.setFont("helvetica", "normal");
  doc.text(order.createdAt.toLocaleDateString("id-ID"), signatureX, yPos);

  // Customer notes section
  yPos = pageHeight - 25;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Catatan pelanggan", margin, yPos);
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  yPos += 5;
  if (order.note) {
    const noteLines = doc.splitTextToSize(order.note, pageWidth - 2 * margin);
    doc.text(noteLines, margin, yPos);
  }

  const arrayBuffer = doc.output("arraybuffer");
  return new NextResponse(arrayBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename=${order.invoiceNumber}.pdf`
    }
  });
}
