-- CreateEnum
CREATE TYPE "language_proficiency" AS ENUM ('BASIC', 'CONVERSATIONAL', 'FLUENT', 'NATIVE_BILINGUAL');

-- CreateTable
CREATE TABLE "language" (
    "id" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "proficiency" "language_proficiency" NOT NULL,
    "freelancer_id" TEXT NOT NULL,

    CONSTRAINT "language_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "language" ADD CONSTRAINT "language_freelancer_id_fkey" FOREIGN KEY ("freelancer_id") REFERENCES "freelancer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
