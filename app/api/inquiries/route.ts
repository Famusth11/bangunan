import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  const inquiry = await prisma.inquiry.create({
    data: {
      name: body.name,
      whatsapp: body.whatsapp,
      message: body.message
    }
  });
  return NextResponse.json(inquiry, { status: 201 });
}
