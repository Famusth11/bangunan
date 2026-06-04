import { z } from "zod";

const requiredText = (label: string) => z.string().trim().min(1, `${label} wajib diisi`);
const money = (label: string) => z.number().finite(`${label} harus berupa angka`).min(0, `${label} tidak boleh minus`);
const positiveInt = (label: string) => z.number().int(`${label} harus bilangan bulat`).min(1, `${label} minimal 1`);

export const salesOrderSchema = z.object({
  invoiceNumber: z.string().optional(),
  customerName: requiredText("Nama customer"),
  whatsapp: requiredText("Nomor WhatsApp").regex(/^[0-9+\-\s()]{8,20}$/, "Nomor WhatsApp tidak valid"),
  projectAddress: requiredText("Alamat proyek"),
  item: requiredText("Barang"),
  quantity: positiveInt("Quantity"),
  price: money("Harga"),
  paymentStatus: z.enum(["LUNAS", "BELUM"]),
  deliveryStatus: requiredText("Status pengiriman"),
  orderStatus: z.enum(["PENDING", "PROSES", "SELESAI"]),
  customerId: z.string().optional().nullable()
});

export const purchaseOrderSchema = z.object({
  supplierName: requiredText("Nama supplier"),
  item: requiredText("Barang"),
  costPrice: money("Harga modal"),
  shippingCost: money("Ongkir").optional().default(0),
  eta: z.date().optional().nullable(),
  paymentStatus: z.enum(["LUNAS", "BELUM"]),
  supplierId: z.string().optional().nullable()
});

export const customerSchema = z.object({
  name: requiredText("Nama"),
  whatsapp: requiredText("No WA").regex(/^[0-9+\-\s()]{8,20}$/, "No WA tidak valid"),
  address: requiredText("Alamat"),
  category: z.enum(["RETAIL", "TUKANG", "APLIKATOR", "KONTRAKTOR", "MANDOR"])
});

export const supplierSchema = z.object({
  name: requiredText("Nama supplier"),
  salesContact: requiredText("Kontak sales"),
  area: requiredText("Area"),
  paymentTerm: requiredText("Tempo pembayaran"),
  productType: requiredText("Jenis barang"),
  latestPricelist: money("Pricelist terakhir")
});

export const financeSchema = z.object({
  title: requiredText("Judul"),
  type: z.enum(["MASUK", "KELUAR", "HUTANG", "PIUTANG", "ONGKIR"]),
  amount: money("Nominal"),
  projectName: z.string().optional().nullable(),
  recordDate: z.date().optional(),
  note: z.string().optional().nullable()
});

export const projectSchema = z.object({
  title: requiredText("Judul proyek"),
  location: requiredText("Lokasi"),
  material: requiredText("Material"),
  projectValue: money("Nilai proyek"),
  beforeImage: z.string().optional().nullable(),
  afterImage: z.string().optional().nullable(),
  isPublished: z.boolean().optional()
});

export const productSchema = z.object({
  name: requiredText("Nama stock barang"),
  description: requiredText("Keterangan"),
  price: money("Harga"),
  imageUrl: z.string().optional().nullable(),
  isPromo: z.boolean().optional()
});
