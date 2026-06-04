import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export async function requireAuth(adminOnly = false) {
  const user = await getSessionUser();
  if (!user) {
    return { user: null, error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }) };
  }
  if (adminOnly && user.role !== "ADMIN") {
    return { user, error: NextResponse.json({ message: "Forbidden" }, { status: 403 }) };
  }
  return { user, error: null };
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ message }, { status });
}

export function parseSearchParams(request: Request) {
  const url = new URL(request.url);
  return {
    q: url.searchParams.get("q") || "",
    page: Math.max(Number(url.searchParams.get("page") || 1), 1),
    limit: Math.min(Math.max(Number(url.searchParams.get("limit") || 10), 1), 100),
    id: url.searchParams.get("id") || undefined
  };
}

export function pagination(page: number, limit: number) {
  return { skip: (page - 1) * limit, take: limit };
}
