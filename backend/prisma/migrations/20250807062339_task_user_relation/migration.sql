-- DropForeignKey
ALTER TABLE "public"."Task" DROP CONSTRAINT "Task_createdById_fkey";

-- DropForeignKey
ALTER TABLE "public"."Task" DROP CONSTRAINT "Task_groupId_fkey";

-- DropForeignKey
ALTER TABLE "public"."User" DROP CONSTRAINT "User_group_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."User" DROP CONSTRAINT "User_work_id_fkey";

-- AlterTable
ALTER TABLE "public"."Task" ALTER COLUMN "groupId" DROP NOT NULL,
ALTER COLUMN "createdById" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "group_id" DROP NOT NULL,
ALTER COLUMN "work_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_work_id_fkey" FOREIGN KEY ("work_id") REFERENCES "public"."Workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Task" ADD CONSTRAINT "Task_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "public"."Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Task" ADD CONSTRAINT "Task_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
