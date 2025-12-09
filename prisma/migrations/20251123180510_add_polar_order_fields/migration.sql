-- AlterTable
ALTER TABLE "order" ADD COLUMN     "checkoutId" TEXT,
ADD COLUMN     "paymentId" TEXT,
ADD COLUMN     "paymentMethod" TEXT,
ADD COLUMN     "polarOrderId" TEXT;
