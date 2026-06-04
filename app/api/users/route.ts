import { NextResponse } from "next/server";
import type { Prisma, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { jsonError, pagination, parseSearchParams, requireAuth } from "@/lib/api";

export async function GET(request: Request) {
  const auth = await requireAuth(true);
  if (auth.error) return auth.error;

  const { q, page, limit } = parseSearchParams(request);
  const roleQuery = q.toUpperCase() === "ADMIN" || q.toUpperCase() === "STAFF" ? (q.toUpperCase() as Role) : null;
  const where: Prisma.UserWhereInput = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          ...(roleQuery ? [{ role: roleQuery }] : [])
        ]
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
      ...pagination(page, limit)
    }),
    prisma.user.count({ where })
  ]);

  return NextResponse.json({ items, total, page, limit });
}

export async function POST(request: Request) {
  const auth = await requireAuth(true);
  if (auth.error) return auth.error;

  const body = await request.json();
  if (!body.name || !body.email || !body.password) return jsonError("Nama, email, dan password wajib diisi");
  if (String(body.password).length < 8) return jsonError("Password minimal 8 karakter");

  const item = await prisma.user.create({
    data: {
      name: body.name,
      email: body.email,
      passwordHash: await bcrypt.hash(body.password, 12),
      role: body.role === "ADMIN" ? "ADMIN" : "STAFF"
    },
    select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true }
  });

  return NextResponse.json(item, { status: 201 });
}

export async function PATCH(request: Request) {
  const auth = await requireAuth(true);
  if (auth.error) return auth.error;

  const body = await request.json();
  if (!body.id) return jsonError("ID wajib diisi");

  const data: { name?: string; email?: string; role?: "ADMIN" | "STAFF"; passwordHash?: string } = {
    name: body.name,
    email: body.email,
    role: body.role === "ADMIN" ? "ADMIN" : "STAFF"
  };
  if (body.password) {
    if (String(body.password).length < 8) return jsonError("Password minimal 8 karakter");
    data.passwordHash = await bcrypt.hash(body.password, 12);
  }

  const item = await prisma.user.update({
    where: { id: body.id },
    data,
    select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true }
  });

  return NextResponse.json(item);
}

export async function DELETE(request: Request) {
  const auth = await requireAuth(true);
  if (auth.error) return auth.error;

  const { id } = parseSearchParams(request);
  if (!id) return jsonError("ID wajib diisi");
  if (id === auth.user?.id) return jsonError("User sedang login tidak bisa menghapus dirinya sendiri");

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
