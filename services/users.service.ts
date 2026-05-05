"use server";

import { z } from "zod";
import { prisma } from "../lib/prisma";
import { hashPassword } from "../lib/auth.password";
import { revalidatePath } from "next/cache";

// schema untuk validasi
const userSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter").optional(),
  gender: z.enum(["LAKI_LAKI", "PEREMPUAN"]).optional(),
  role: z.enum(["DEVELOPER", "ADMIN", "STAFF"]).optional(),
  isActive: z.boolean().optional(),
});

const updateUserSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").optional(),
  email: z.string().email("Email tidak valid").optional(),
  gender: z.enum(["LAKI_LAKI", "PEREMPUAN"]).optional(),
  role: z.enum(["DEVELOPER", "ADMIN", "STAFF"]).optional(),
  isActive: z.boolean().optional(),
});

// Get all users
export async function getUsers(params?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}) {
  try {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params?.search) {
      where.OR = [
        { name: { contains: params.search, mode: "insensitive" } },
        { email: { contains: params.search, mode: "insensitive" } },
      ];
    }

    if (params?.role) {
      where.role = params.role;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          gender: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Get users error:", error);
    return { success: false, error: "Gagal mengambil data users" };
  }
}

// Get single user
export async function getUser(id: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        gender: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return { success: false, error: "User tidak ditemukan" };
    }

    return { success: true, data: user };
  } catch (error) {
    console.error("Get user error:", error);
    return { success: false, error: "Gagal mengambil data user" };
  }
}

// Create user
export async function createUser(formData: FormData) {
  try {
    const rawData = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      gender: formData.get("gender"),
      role: formData.get("role"),
    };

    const result = userSchema.safeParse(rawData);
    if (!result.success) {
      return { success: false, error: result.error.message };
    }

    const { name, email, password, gender, role } = result.data;

    // Cek email sudah ada
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { success: false, error: "Email sudah terdaftar" };
    }

    const hashedPassword = await hashPassword(password || "password123");

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        gender,
        role: role || "STAFF",
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        gender: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    revalidatePath("/users");
    return { success: true, data: user };
  } catch (error) {
    console.error("Create user error:", error);
    return { success: false, error: "Gagal membuat user" };
  }
}

// Update user
export async function updateUser(id: string, formData: FormData) {
  try {
    const rawData = {
      name: formData.get("name"),
      email: formData.get("email"),
      gender: formData.get("gender"),
      role: formData.get("role"),
      isActive: formData.get("isActive") === "true",
    };

    // ✅ Konversi ke string dengan aman
    const name = rawData.name?.toString() || "";
    const email = rawData.email?.toString() || "";
    const gender = rawData.gender?.toString();
    const role = rawData.role?.toString();

    const result = updateUserSchema.safeParse({
      name,
      email,
      gender,
      role,
      isActive: rawData.isActive,
    });

    if (!result.success) {
      return { success: false, error: result.error.message };
    }

    // Cek user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return { success: false, error: "User tidak ditemukan" };
    }

    // ✅ Cek email tidak digunakan user lain - dengan toString()
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: email }, // ✅ Sekarang aman
      });
      if (emailExists) {
        return { success: false, error: "Email sudah digunakan" };
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        name: name || null,
        email: email,
        gender: gender as any,
        role: role as any,
        isActive: rawData.isActive,
      },
      select: {
        id: true,
        name: true,
        email: true,
        gender: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

    revalidatePath("/users");
    return { success: true, data: user };
  } catch (error) {
    console.error("Update user error:", error);
    return { success: false, error: "Gagal mengupdate user" };
  }
}

// Delete user
export async function deleteUser(id: string) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return { success: false, error: "User tidak ditemukan" };
    }

    await prisma.user.delete({
      where: { id },
    });

    revalidatePath("/users");
    return { success: true };
  } catch (error) {
    console.error("Delete user error:", error);
    return { success: false, error: "Gagal menghapus user" };
  }
}

// Reset password user
export async function resetUserPassword(id: string, newPassword: string) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return { success: false, error: "User tidak ditemukan" };
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    revalidatePath("/users");
    return { success: true };
  } catch (error) {
    console.error("Reset password error:", error);
    return { success: false, error: "Gagal mereset password" };
  }
}
