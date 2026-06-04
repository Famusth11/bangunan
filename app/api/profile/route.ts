import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionToken, getSessionUser, hashPassword, sessionCookieName, verifyPassword } from "@/lib/auth";
import { jsonError } from "@/lib/api";

export async function GET() {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true }
  });

  if (!user) return NextResponse.json({ message: "User tidak ditemukan" }, { status: 404 });
  return NextResponse.json(user);
}

export async function PATCH(request: Request) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  if (!body.name || !body.email) return jsonError("Nama dan email wajib diisi");

  const current = await prisma.user.findUnique({ where: { id: session.id } });
  if (!current) return NextResponse.json({ message: "User tidak ditemukan" }, { status: 404 });

  const data: { name: string; email: string; passwordHash?: string } = {
    name: body.name,
    email: body.email
  };

  if (body.newPassword) {
    if (!body.currentPassword) return jsonError("Password lama wajib diisi");
    if (String(body.newPassword).length < 8) return jsonError("Password baru minimal 8 karakter");
    if (!(await verifyPassword(body.currentPassword, current.passwordHash))) {
      return jsonError("Password lama salah", 401);
    }
    data.passwordHash = await hashPassword(body.newPassword);
  }

  try {
    const updated = await prisma.user.update({
      where: { id: session.id },
      data,
      select: { id: true, name: true, email: true, role: true }
    });

    const response = NextResponse.json(updated);
    response.cookies.set(sessionCookieName(), await createSessionToken(updated), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7
    });
    return response;
  } catch {
    return jsonError("Email sudah digunakan user lain");
  }
}
