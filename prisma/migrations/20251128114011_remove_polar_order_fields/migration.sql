/*
  Warnings:

  - You are about to drop the column `checkoutId` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `paymentId` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `paymentMethod` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `polarOrderId` on the `order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "order" DROP COLUMN "checkoutId",
DROP COLUMN "paymentId",
DROP COLUMN "paymentMethod",
DROP COLUMN "polarOrderId";
