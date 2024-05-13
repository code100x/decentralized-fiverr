/*
  Warnings:

  - Changed the type of `amount` on the `Task` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Task" DROP COLUMN "amount",
ADD COLUMN     "amount" INTEGER NOT NULL;
