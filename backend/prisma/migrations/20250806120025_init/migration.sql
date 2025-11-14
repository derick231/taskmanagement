/*
  Warnings:

  - Made the column `password` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "password" SET NOT NULL;

-- CreateTable
CREATE TABLE "public"."Workspace" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "tags" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);
