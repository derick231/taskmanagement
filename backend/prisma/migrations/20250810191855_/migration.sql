/*
  Warnings:

  - You are about to drop the column `due_date` on the `Task` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workspaceId` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Made the column `groupId` on table `Task` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."Task" DROP CONSTRAINT "Task_groupId_fkey";

-- AlterTable
ALTER TABLE "public"."Task" DROP COLUMN "due_date",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "dueDate" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "workspaceId" INTEGER NOT NULL,
ALTER COLUMN "groupId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Task_groupId_idx" ON "public"."Task"("groupId");

-- CreateIndex
CREATE INDEX "Task_workspaceId_idx" ON "public"."Task"("workspaceId");

-- CreateIndex
CREATE INDEX "Task_createdById_idx" ON "public"."Task"("createdById");

-- CreateIndex
CREATE INDEX "Task_priority_idx" ON "public"."Task"("priority");

-- CreateIndex
CREATE INDEX "Task_dueDate_idx" ON "public"."Task"("dueDate");

-- AddForeignKey
ALTER TABLE "public"."Task" ADD CONSTRAINT "Task_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "public"."Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Task" ADD CONSTRAINT "Task_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
