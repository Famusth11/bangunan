import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "STAFF";
};

const cookieName = "bangunan_session";

function secretKey() {
  const secret = process.env.JWT_SECRET || "development-secret-change-this-value";
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(user: SessionUser) {
  return new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey());
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function login(email: string, password: string) {
  let user;
  try {
    user = await prisma.user.findUnique({ where: { email } });
  } catch (error) {
    throw error;
  }

  if (!user || !(await verifyPassword(password, user.passwordHash))) return null;

  const sessionUser: SessionUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
  return { user: sessionUser, token: await createSessionToken(sessionUser) };
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token) return null;

  try {
    const verified = await jwtVerify(token, secretKey());
    return verified.payload as SessionUser;
  } catch {
    return null;
  }
}

export function sessionCookieName() {
  return cookieName;
}
