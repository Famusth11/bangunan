import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { id } = await params;
  const item = await prisma.salesOrder.findUnique({ where: { id } });
  if (!item) return NextResponse.json({ message: "Order tidak ditemukan" }, { status: 404 });
  return NextResponse.json(item);
}
