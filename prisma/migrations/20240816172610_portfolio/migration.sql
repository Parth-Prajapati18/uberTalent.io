-- CreateEnum
CREATE TYPE "portfolio_content_type" AS ENUM ('IMAGE', 'PDF');

-- CreateTable
CREATE TABLE "portfolio" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "url" TEXT,
    "skills" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "freelancer_id" TEXT NOT NULL,

    CONSTRAINT "portfolio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portfolio_content" (
    "id" TEXT NOT NULL,
    "type" "portfolio_content_type" NOT NULL,
    "content" TEXT NOT NULL,
    "portfolio_id" TEXT NOT NULL,

    CONSTRAINT "portfolio_content_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "portfolio" ADD CONSTRAINT "portfolio_freelancer_id_fkey" FOREIGN KEY ("freelancer_id") REFERENCES "freelancer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolio_content" ADD CONSTRAINT "portfolio_content_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
