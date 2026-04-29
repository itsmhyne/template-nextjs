// lib/auth/session.ts
import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const SESSION_TOKEN_NAME = "auth_token";
const SESSION_EXPIRY_DAYS = 7;

export async function createSession(userId: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS);

  await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  return token;
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_TOKEN_NAME)?.value;

  if (!token) return null;

  const session = await prisma.session.findFirst({
    where: {
      token,
      expiresAt: {
        gt: new Date(),
      },
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          gender: true,
        },
      },
    },
  });

  return session;
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_EXPIRY_DAYS * 24 * 60 * 60,
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_TOKEN_NAME)?.value;

  if (token) {
    await prisma.session.deleteMany({
      where: { token },
    });
  }

  cookieStore.delete(SESSION_TOKEN_NAME);
}
