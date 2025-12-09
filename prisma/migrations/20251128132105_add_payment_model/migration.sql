-- AlterTable
ALTER TABLE "order" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'MKD',
ALTER COLUMN "shippingAddress" DROP NOT NULL,
ALTER COLUMN "billingAddress" DROP NOT NULL;

-- CreateTable
CREATE TABLE "payment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'MKD',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "provider" TEXT NOT NULL DEFAULT 'polar',
    "providerPaymentId" TEXT,
    "providerOrderId" TEXT,
    "checkoutId" TEXT,
    "paymentMethod" TEXT,
    "customerEmail" TEXT,
    "customerName" TEXT,
    "metadata" JSONB,
    "failureReason" TEXT,
    "refundedAmount" DECIMAL(10,2),
    "refundedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "payment_orderId_idx" ON "payment"("orderId");

-- CreateIndex
CREATE INDEX "payment_providerPaymentId_idx" ON "payment"("providerPaymentId");

-- CreateIndex
CREATE INDEX "payment_checkoutId_idx" ON "payment"("checkoutId");

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
