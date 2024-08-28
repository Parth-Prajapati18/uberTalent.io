/*
  Warnings:

  - The `status` column on the `freelancer` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `createdAt` on the `invoice` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `invoice` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to drop the column `weekNumber` on the `timesheet` table. All the data in the column will be lost.
  - You are about to drop the column `weekStart` on the `timesheet` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[week_start,contract_id]` on the table `timesheet` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `week_number` to the `timesheet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `week_start` to the `timesheet` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "freelancer_status" AS ENUM ('ACTIVE', 'ON_HOLD', 'SUSPENDED', 'NO_PAYMENT');

-- DropIndex
DROP INDEX "timesheet_weekStart_contract_id_key";

-- AlterTable
ALTER TABLE "client" ADD COLUMN     "stripe_customer_id" TEXT;

-- AlterTable
ALTER TABLE "contract" ADD COLUMN     "payment_service" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "freelancer" ADD COLUMN     "stripe_acct_id" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "freelancer_status";

-- AlterTable
ALTER TABLE "invoice" DROP COLUMN "createdAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "stripe_payment_intent" TEXT,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "timesheet" DROP COLUMN "weekNumber",
DROP COLUMN "weekStart",
ADD COLUMN     "is_paid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "week_number" INTEGER NOT NULL,
ADD COLUMN     "week_start" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "timesheet_week_start_contract_id_key" ON "timesheet"("week_start", "contract_id");

update freelancer set status = 'ACTIVE';