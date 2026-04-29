/*
  Warnings:

  - Added the required column `gender` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('DEVELOPER', 'ADMIN', 'STAFF');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('LAKI_LAKI', 'PEREMPUAN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "gender" "Gender" NOT NULL,
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'STAFF';
