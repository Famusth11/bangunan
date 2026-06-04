import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const protectedPaths = ["/admin"];

function secretKey() {
  const secret = process.env.JWT_SECRET || "development-secret-change-this-value";
  return new TextEncoder().encode(secret);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!protectedPaths.some((path) => pathname.startsWith(path))) return NextResponse.next();
  if (pathname.startsWith("/admin/login")) return NextResponse.next();

  const token = request.cookies.get("bangunan_session")?.value;
  if (!token) return NextResponse.redirect(new URL("/admin/login", request.url));

  try {
    await jwtVerify(token, secretKey());
    return NextResponse.next();
  } catch {
    const response = NextResponse.redirect(new URL("/admin/login", request.url));
    response.cookies.delete("bangunan_session");
    return response;
  }
}

export const config = {
  matcher: ["/admin/:path*"]
};
