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
  gender: z.enum(["LAKI_LAKI", "PEREMPUAN"], {
    error: "Gender harus dipilih",
  }),
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
  try {
    const rawData = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      gender: formData.get("gender"),
    };

    console.log("Received data:", rawData); // Debug log

    const result = registerSchema.safeParse(rawData);

    if (!result.success) {
      console.error("Validation error:", result.error);
      return { error: result.error.message || "Validasi gagal" };
    }

    const { name, email, password, gender } = result.data;

    // Cek user sudah ada
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "Email sudah terdaftar" };
    }

    const hashedPassword = await hashPassword(password);

    // Create user dengan gender
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        gender: (gender as any) || null,
      },
    });

    console.log("User created:", { id: user.id, gender: user.gender }); // Debug log

    const token = await createSession(user.id);
    await setSessionCookie(token);

    // Gunakan return instead of redirect untuk client-side navigation
    return { success: true, redirectTo: "/dashboard" };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "Terjadi kesalahan saat registrasi" };
  }
}

export async function logoutAction() {
  await deleteSession();
  redirect("/login");
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user || null;
}
