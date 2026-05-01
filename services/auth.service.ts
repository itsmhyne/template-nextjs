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
import { ResponseType } from "../types/response.type";

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

// ✅ LOGIN - Return object instead of redirect
export async function loginAction(formData: FormData): Promise<ResponseType> {
  try {
    const rawData = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    const result = loginSchema.safeParse(rawData);
    if (!result.success) {
      return { success: false, error: result.error.message };
    }

    const { email, password } = result.data;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.password) {
      return { success: false, error: "Email atau password salah" };
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return { success: false, error: "Email atau password salah" };
    }

    // Buat session
    const token = await createSession(user.id);
    await setSessionCookie(token);

    // ✅ Kembalikan data user
    return {
      success: true,
      redirectTo: "/dashboard",
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        gender: user.gender,
      },
    };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "Terjadi kesalahan saat login" };
  }
}

// ✅ REGISTER - Already good, return object
export async function registerAction(
  formData: FormData
): Promise<ResponseType> {
  try {
    const rawData = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      gender: formData.get("gender"),
    };

    console.log("Received data:", rawData);

    const result = registerSchema.safeParse(rawData);

    if (!result.success) {
      console.error("Validation error:", result.error);
      return {
        success: false,
        error: result.error.message || "Validasi gagal",
      };
    }

    const { name, email, password, gender } = result.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { success: false, error: "Email sudah terdaftar" };
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        gender: (gender as any) || null,
      },
    });

    await deleteSession();

    const token = await createSession(user.id);
    await setSessionCookie(token);

    return {
      success: true,
      redirectTo: "/dashboard",
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        gender: user.gender,
      },
    };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, error: "Terjadi kesalahan saat registrasi" };
  }
}

// ✅ LOGOUT - Return object instead of redirect
export async function logoutAction(): Promise<ResponseType> {
  try {
    await deleteSession();
    return { success: true, redirectTo: "/login" };
  } catch (error) {
    console.error("Logout error:", error);
    return { success: false, error: "Terjadi kesalahan saat logout" };
  }
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user || null;
}
