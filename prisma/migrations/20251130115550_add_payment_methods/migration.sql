/*
  Warnings:

  - You are about to drop the column `paymentMethod` on the `payment` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CARD', 'CASH_ON_DELIVERY', 'BANK_TRANSFER', 'DIGITAL_WALLET');

-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'REFUNDED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PaymentStatus" ADD VALUE 'CASH_PENDING';
ALTER TYPE "PaymentStatus" ADD VALUE 'CASH_RECEIVED';

-- AlterTable
ALTER TABLE "order" ADD COLUMN     "deliveryDate" TIMESTAMP(3),
ADD COLUMN     "deliveryNotes" TEXT,
ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'CARD';

-- AlterTable
ALTER TABLE "payment" DROP COLUMN "paymentMethod",
ADD COLUMN     "confirmedAt" TIMESTAMP(3),
ADD COLUMN     "confirmedBy" TEXT,
ADD COLUMN     "deliveryAddress" TEXT,
ADD COLUMN     "deliveryNotes" TEXT,
ADD COLUMN     "method" "PaymentMethod" NOT NULL DEFAULT 'CARD',
ADD COLUMN     "paymentMethodDetails" TEXT;

-- CreateIndex
CREATE INDEX "payment_method_idx" ON "payment"("method");

-- CreateIndex
CREATE INDEX "payment_status_idx" ON "payment"("status");
