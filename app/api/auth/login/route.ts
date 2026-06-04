import { NextResponse } from "next/server";
import { login, sessionCookieName } from "@/lib/auth";

export async function POST(request: Request) {
  const { email, password } = await request.json();
  let result;

  try {
    result = await login(email, password);
  } catch {
    return NextResponse.json(
      { message: "Database belum aktif. Jalankan PostgreSQL, migrasi, dan seed terlebih dahulu." },
      { status: 503 }
    );
  }

  if (!result) {
    return NextResponse.json({ message: "Email atau password salah" }, { status: 401 });
  }

  const response = NextResponse.json({ user: result.user });
  response.cookies.set(sessionCookieName(), result.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
  return response;
}
