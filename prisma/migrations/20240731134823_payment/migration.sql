/*
  Warnings:

  - The values [NO_PAYMENT] on the enum `freelancer_status` will be removed. If these variants are still used in the database, this will fail.
  - Made the column `monday_hours` on table `timesheet` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tuesday_hours` on table `timesheet` required. This step will fail if there are existing NULL values in that column.
  - Made the column `wednesday_hours` on table `timesheet` required. This step will fail if there are existing NULL values in that column.
  - Made the column `thursday_hours` on table `timesheet` required. This step will fail if there are existing NULL values in that column.
  - Made the column `friday_hours` on table `timesheet` required. This step will fail if there are existing NULL values in that column.
  - Made the column `saturday_hours` on table `timesheet` required. This step will fail if there are existing NULL values in that column.
  - Made the column `sunday_hours` on table `timesheet` required. This step will fail if there are existing NULL values in that column.
  - Made the column `total_week_hours` on table `timesheet` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "payment_method_status" AS ENUM ('NONE', 'VALID', 'INVALID');

-- CreateEnum
CREATE TYPE "client_status" AS ENUM ('ACTIVE', 'ON_HOLD', 'SUSPENDED');

-- AlterEnum
BEGIN;
CREATE TYPE "freelancer_status_new" AS ENUM ('ACTIVE', 'ON_HOLD', 'SUSPENDED');
ALTER TABLE "freelancer" ALTER COLUMN "status" TYPE "freelancer_status_new" USING ("status"::text::"freelancer_status_new");
ALTER TYPE "freelancer_status" RENAME TO "freelancer_status_old";
ALTER TYPE "freelancer_status_new" RENAME TO "freelancer_status";
DROP TYPE "freelancer_status_old";
COMMIT;

-- AlterTable
ALTER TABLE "client" ADD COLUMN     "payment_method_status" "payment_method_status" DEFAULT 'NONE',
ADD COLUMN     "status" "client_status" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "contract" ALTER COLUMN "payment_service" SET DEFAULT true;

-- AlterTable
ALTER TABLE "timesheet" ADD COLUMN     "payment_intent_created" TIMESTAMP(3),
ADD COLUMN     "payment_intent_id" TEXT,
ADD COLUMN     "rate" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "monday_hours" SET NOT NULL,
ALTER COLUMN "monday_hours" SET DEFAULT 0,
ALTER COLUMN "tuesday_hours" SET NOT NULL,
ALTER COLUMN "tuesday_hours" SET DEFAULT 0,
ALTER COLUMN "wednesday_hours" SET NOT NULL,
ALTER COLUMN "wednesday_hours" SET DEFAULT 0,
ALTER COLUMN "thursday_hours" SET NOT NULL,
ALTER COLUMN "thursday_hours" SET DEFAULT 0,
ALTER COLUMN "friday_hours" SET NOT NULL,
ALTER COLUMN "friday_hours" SET DEFAULT 0,
ALTER COLUMN "saturday_hours" SET NOT NULL,
ALTER COLUMN "saturday_hours" SET DEFAULT 0,
ALTER COLUMN "sunday_hours" SET NOT NULL,
ALTER COLUMN "sunday_hours" SET DEFAULT 0,
ALTER COLUMN "total_week_hours" SET NOT NULL,
ALTER COLUMN "total_week_hours" SET DEFAULT 0;

-- CreateTable
CREATE TABLE "payment_log" (
    "id" TEXT NOT NULL,
    "log_text" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,
    "timesheet_id" TEXT NOT NULL,

    CONSTRAINT "payment_log_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "payment_log" ADD CONSTRAINT "payment_log_timesheet_id_fkey" FOREIGN KEY ("timesheet_id") REFERENCES "timesheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_log" ADD CONSTRAINT "payment_log_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
