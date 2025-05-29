/*
  Warnings:

  - The `image` column on the `category` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "category" DROP COLUMN "image",
ADD COLUMN     "image" JSONB;
