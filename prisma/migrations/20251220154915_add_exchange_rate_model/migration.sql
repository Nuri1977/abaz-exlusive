-- CreateTable
CREATE TABLE "exchange_rate" (
    "id" TEXT NOT NULL,
    "baseCurrency" TEXT NOT NULL,
    "targetCurrency" TEXT NOT NULL,
    "rate" DECIMAL(10,6) NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'api',
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exchange_rate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "exchange_rate_baseCurrency_targetCurrency_idx" ON "exchange_rate"("baseCurrency", "targetCurrency");

-- CreateIndex
CREATE INDEX "exchange_rate_expiresAt_idx" ON "exchange_rate"("expiresAt");

-- CreateIndex
CREATE INDEX "exchange_rate_isActive_idx" ON "exchange_rate"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "exchange_rate_baseCurrency_targetCurrency_isActive_key" ON "exchange_rate"("baseCurrency", "targetCurrency", "isActive");
