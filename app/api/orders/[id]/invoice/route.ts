import { NextResponse } from "next/server";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api";
import { rupiah } from "@/lib/format";

// Pastikan menggunakan runtime nodejs karena jspdf butuh module pdfkit/node
export const runtime = "nodejs";

// Antarmuka Extended agar jsPDF mengenali properti internal autoTable tanpa error casting
interface ExtendedJsPDF extends jsPDF {
  lastAutoTable?: {
    finalY: number;
  };
}

export async function GET(
  _: Request,
  context: { params: Promise<{ id: string }> }
) {
  // 1. Autentikasi
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  // 2. Ambil ID dari parameter URL (Next.js 15+ params adalah Promise)
  const { id } = await context.params;

  // 3. Fetch data Pesanan dari Database
  const orderData = await prisma.salesOrder.findUnique({ where: { id } });
  
  if (!orderData) {
    return NextResponse.json(
      { message: "Order tidak ditemukan" },
      { status: 404 }
    );
  }

  // 4. Normalisasi Data (Mengubah Decimal/Date Prisma menjadi tipe primitives)
  const order = {
    id: String(orderData.id),
    invoiceNumber: orderData.invoiceNumber ?? "0000",
    customerName: orderData.customerName ?? "Pelanggan",
    whatsapp: orderData.whatsapp ?? "-",
    projectAddress: orderData.projectAddress ?? "-",
    item: orderData.item ?? "Item",
    quantity: Number(orderData.quantity ?? 0),
    price: orderData.price ? Number(orderData.price) : 0,
    paymentStatus: String(orderData.paymentStatus ?? "BELUM LUNAS"),
    note: "",
    createdAt: orderData.createdAt ? new Date(orderData.createdAt) : new Date(),
  };

  // 5. Inisialisasi jsPDF
  const doc = new jsPDF() as ExtendedJsPDF;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const total = order.price * order.quantity;
  const margin = 14;
  const rightColumn = pageWidth - margin - 50;

  // --- HEADER ---
  // Info Perusahaan (Kiri)
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("BANGUNAWAR", margin, 15);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Karangnangka RT 02 RW 01", margin, 21);
  doc.text("089525626994", margin, 26);
  doc.text("wildanpowel@gmail.com", margin, 31);

  // Judul FAKTUR (Kanan)
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("FAKTUR", rightColumn + 5, 18);

  // Invoice & Tanggal (Kanan)
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`#${order.invoiceNumber}`, rightColumn + 5, 28);
  doc.text(`Tanggal: ${order.createdAt.toLocaleDateString("id-ID")}`, rightColumn + 5, 34);

  // --- IDENTITAS PELANGGAN ---
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

  // --- TABEL ITEM ---
  yPos += 8;
  autoTable(doc, {
    startY: yPos,
    head: [["#", "Item", "Satuan", "Kuantitas", "Biaya satuan", "Total"]],
    body: [
      [
        "1",
        order.item,
        "Meter",
        order.quantity.toString(),
        rupiah(order.price.toString()),
        rupiah(total.toString()),
      ],
    ],
    columnStyles: {
      0: { cellWidth: 8, halign: "center" },
      1: { cellWidth: 50 },
      2: { cellWidth: 20, halign: "center" },
      3: { cellWidth: 20, halign: "center" },
      4: { cellWidth: 30, halign: "right" },
      5: { cellWidth: 32, halign: "right" },
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
      textColor: [0, 0, 0],
    },
    headStyles: {
      fillColor: [220, 220, 220],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      fontSize: 9,
    },
    margin: { left: margin, right: margin },
  });

  // --- SUBTOTAL & TOTAL ---
  const finalY = doc.lastAutoTable?.finalY ?? yPos + 20;
  yPos = finalY + 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  const subtotalX = pageWidth - margin - 70;
  doc.text("Subtotal", subtotalX, yPos);
  doc.text(rupiah(total.toString()), pageWidth - margin - 2, yPos, { align: "right" });

  // Garis Pemisah
  yPos += 4;
  doc.setDrawColor(180);
  doc.setLineWidth(0.5);
  doc.line(subtotalX, yPos, pageWidth - margin, yPos);

  // Total Akhir
  yPos += 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Total", subtotalX, yPos);
  doc.text(rupiah(total.toString()), pageWidth - margin - 2, yPos, { align: "right" });

  // --- Tanda Tangan & Status ---
  yPos += 15;
  const signatureX = pageWidth - margin - 55;

  // Stempel Status Pembayaran
  doc.setFontSize(16);
  const isLunas = order.paymentStatus === "LUNAS";
  if (isLunas) {
    doc.setTextColor(100, 180, 100); // Hijau
    doc.text("LUNAS", signatureX - 5, yPos + 8, { angle: -20 });
  } else {
    doc.setTextColor(220, 100, 100); // Merah
    doc.setFontSize(14);
    doc.text("BELUM LUNAS", signatureX - 10, yPos + 8, { angle: -20 });
  }

  // Reset warna teks
  doc.setTextColor(0, 0, 0);

  // Garis Tanda Tangan
  yPos += 20;
  doc.setFontSize(9);
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.line(signatureX, yPos, pageWidth - margin - 5, yPos);

  // Teken tangan (Visual)
  doc.setLineWidth(0.3);
  doc.setTextColor(80, 80, 80);
  const sigStartX = signatureX + 5;
  const sigY = yPos - 8;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(12);
  doc.text("Wildan", sigStartX, sigY);

  // Nama & Tanggal Penandatangan
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  yPos += 4;
  doc.text("M Wildan Munawar", signatureX, yPos);
  yPos += 5;
  doc.setFont("helvetica", "normal");
  doc.text(order.createdAt.toLocaleDateString("id-ID"), signatureX, yPos);

  // --- CATATAN PELANGGAN ---
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

  // --- OUTPUT RESPONSE ---
  const arrayBuffer = doc.output("arraybuffer");
  return new NextResponse(arrayBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename=${order.invoiceNumber}.pdf`,
    },
  });
}