// services/auth.service.ts
"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import {
  createSession,
  setSessionCookie,
  deleteSession,
  getSession,
} from "../lib/auth.session";
import { prisma } from "../lib/prisma";
import { hashPassword, verifyPassword } from "../lib/auth.password";

const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export async function loginAction(formData: FormData) {
  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const result = loginSchema.safeParse(rawData);

  if (!result.success) {
    return {
      success: false,
      error: result.error.message,
    };
  }

  const { email, password } = result.data;

  // Cari user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  // Cek user exist dan password valid
  if (!user || !user.password) {
    return {
      success: false,
      error: "Email atau password salah",
    };
  }

  const isValid = await verifyPassword(password, user.password);

  if (!isValid) {
    return {
      success: false,
      error: "Email atau password salah",
    };
  }

  // Buat session
  const token = await createSession(user.id);
  await setSessionCookie(token);

  // Redirect di sini akan throw error, tapi kita handle di client
  redirect("/dashboard");
}

export async function registerAction(formData: FormData) {
  const rawData = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const result = registerSchema.safeParse(rawData);

  if (!result.success) {
    return { error: result.error.message };
  }

  const { name, email, password } = result.data;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: "Email sudah terdaftar" };
  }

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  const token = await createSession(user.id);
  await setSessionCookie(token);

  redirect("/dashboard");
}

export async function logoutAction() {
  await deleteSession();
  redirect("/login");
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user || null;
}
