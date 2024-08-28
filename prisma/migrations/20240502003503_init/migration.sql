-- CreateEnum
CREATE TYPE "timesheet_status" AS ENUM ('PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "timesheet_issue_status" AS ENUM ('NO_ISSUE', 'UNDER_REVIEW', 'RESOLVED', 'UNRESOLVED');

-- CreateEnum
CREATE TYPE "invoice_status" AS ENUM ('UNPAID', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "invoice_issue_status" AS ENUM ('NO_ISSUE', 'UNDER_REVIEW', 'RESOLVED', 'UNRESOLVED');

-- CreateEnum
CREATE TYPE "job_comp_type" AS ENUM ('HOURLY', 'FIXED');

-- CreateEnum
CREATE TYPE "job_status" AS ENUM ('DRAFT', 'ACTIVE', 'CLOSED');

-- CreateEnum
CREATE TYPE "contract_status" AS ENUM ('PENDING', 'REJECTED', 'WITHDRAWN', 'ACTIVE', 'COMPLETED');

-- CreateEnum
CREATE TYPE "proposal_status" AS ENUM ('DISQUALIFIED', 'OFFER', 'SUBMITTED', 'SHORT_LISTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "availability" AS ENUM ('MORE_THAN_30', 'LESS_THAN_30', 'OPEN_OFFERS', 'NONE');

-- CreateEnum
CREATE TYPE "project_duration" AS ENUM ('ONE_TO_THREE_MONTHS', 'THREE_TO_SIX_MONTHS', 'MORE_THAN_6_MONTHS');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "profile_img" TEXT,
    "status" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "client_id" TEXT,
    "image" TEXT,
    "email_verified" TEXT,
    "clerk_id" TEXT,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "freelancer" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "rate" INTEGER NOT NULL,
    "skills" TEXT[],
    "title" TEXT NOT NULL,
    "overview" TEXT NOT NULL,
    "status" TEXT,
    "country" TEXT,
    "timezone" TEXT,
    "category" TEXT[],
    "availability" "availability",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "freelancer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client" (
    "id" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "company_logo" TEXT,
    "country" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "categories" TEXT[],
    "skills" TEXT[],
    "duration" "project_duration" NOT NULL,
    "comp_type" "job_comp_type" NOT NULL,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "status" "job_status" NOT NULL,
    "hourly_min_rate" INTEGER,
    "hourly_max_rate" INTEGER,
    "project_cost" INTEGER,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_invite" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "invite_message" TEXT NOT NULL,
    "createdby_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_invite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_jobs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposal" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "rate" INTEGER NOT NULL,
    "cover_leter" TEXT NOT NULL,
    "attachments" TEXT,
    "status" "proposal_status" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "contractId" TEXT,

    CONSTRAINT "proposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contract" (
    "id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "freelancer_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "type" "job_comp_type" NOT NULL,
    "rate" INTEGER NOT NULL,
    "status" "contract_status" NOT NULL,
    "weekly_limit" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "title" TEXT,
    "description" TEXT,
    "attachments" TEXT,

    CONSTRAINT "contract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timesheet" (
    "id" TEXT NOT NULL,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "monday_hours" DECIMAL(5,2),
    "tuesday_hours" DECIMAL(5,2),
    "wednesday_hours" DECIMAL(5,2),
    "thursday_hours" DECIMAL(5,2),
    "friday_hours" DECIMAL(5,2),
    "saturday_hours" DECIMAL(5,2),
    "sunday_hours" DECIMAL(5,2),
    "total_week_hours" DECIMAL(5,2),
    "status" "timesheet_status" NOT NULL DEFAULT 'PENDING',
    "issue_status" "timesheet_issue_status",
    "issue_detail" TEXT,
    "resolution_detail" TEXT,
    "user_id" TEXT NOT NULL,
    "contract_id" TEXT NOT NULL,

    CONSTRAINT "timesheet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "invoice_status" NOT NULL,
    "issueStatus" "invoice_issue_status",
    "issue_detail" TEXT,
    "resolution_detail" TEXT,
    "timesheetId" TEXT NOT NULL,

    CONSTRAINT "invoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_clerk_id_key" ON "user"("clerk_id");

-- CreateIndex
CREATE UNIQUE INDEX "freelancer_user_id_key" ON "freelancer"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "job_invite_user_id_job_id_client_id_key" ON "job_invite"("user_id", "job_id", "client_id");

-- CreateIndex
CREATE UNIQUE INDEX "saved_jobs_user_id_job_id_key" ON "saved_jobs"("user_id", "job_id");

-- CreateIndex
CREATE UNIQUE INDEX "proposal_contractId_key" ON "proposal"("contractId");

-- CreateIndex
CREATE UNIQUE INDEX "proposal_user_id_job_id_key" ON "proposal"("user_id", "job_id");

-- CreateIndex
CREATE UNIQUE INDEX "timesheet_weekStart_contract_id_key" ON "timesheet"("weekStart", "contract_id");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "freelancer" ADD CONSTRAINT "freelancer_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job" ADD CONSTRAINT "job_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job" ADD CONSTRAINT "job_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job" ADD CONSTRAINT "job_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_invite" ADD CONSTRAINT "job_invite_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_invite" ADD CONSTRAINT "job_invite_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_invite" ADD CONSTRAINT "job_invite_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_invite" ADD CONSTRAINT "job_invite_createdby_id_fkey" FOREIGN KEY ("createdby_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_jobs" ADD CONSTRAINT "saved_jobs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_jobs" ADD CONSTRAINT "saved_jobs_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal" ADD CONSTRAINT "proposal_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal" ADD CONSTRAINT "proposal_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal" ADD CONSTRAINT "proposal_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "contract"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract" ADD CONSTRAINT "contract_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract" ADD CONSTRAINT "contract_freelancer_id_fkey" FOREIGN KEY ("freelancer_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract" ADD CONSTRAINT "contract_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timesheet" ADD CONSTRAINT "timesheet_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timesheet" ADD CONSTRAINT "timesheet_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "contract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_timesheetId_fkey" FOREIGN KEY ("timesheetId") REFERENCES "timesheet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
