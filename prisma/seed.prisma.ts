import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import { Prisma, PrismaClient } from "../generated/prisma/client";
import bcrypt from "bcryptjs";
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({
  adapter,
});

const userSeeder: Prisma.UserCreateInput[] = [
  {
    name: "Developer",
    email: "developer@dev.com",
    password: "password",
    role: "DEVELOPER",
    gender: "LAKI_LAKI",
  },
  {
    name: "Administrator",
    email: "administrator@dev.com",
    password: "password",
    role: "ADMIN",
    gender: "PEREMPUAN",
  },
  {
    name: "Staff",
    email: "staff@dev.com",
    password: "password",
    role: "STAFF",
    gender: "PEREMPUAN",
  },
];

export async function main() {
  try {
    console.log("🥱 Starting seeding...");

    // Hapus semua data yang ada (dilakukan SEKALI di awal)
    await prisma.user.deleteMany();
    console.log("💔 Cleared existing users");

    // Hash password untuk setiap user
    const usersWithHashedPassword = await Promise.all(
      userSeeder.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10),
      }))
    );

    // Insert semua data sekaligus
    const result = await prisma.user.createMany({
      data: usersWithHashedPassword,
    });

    console.log(`💖 Successfully seeded ${result.count} users`);

    // Verifikasi data yang tersimpan
    const savedUsers = await prisma.user.findMany();
    console.log(
      "Saved users:",
      savedUsers.map((u) => ({ email: u.email, role: u.role }))
    );
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
