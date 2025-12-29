/*
  Warnings:

  - A unique constraint covering the columns `[baseCurrency,targetCurrency,fetchedAt]` on the table `exchange_rate` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "exchange_rate_baseCurrency_targetCurrency_isActive_key";

-- CreateIndex
CREATE UNIQUE INDEX "exchange_rate_baseCurrency_targetCurrency_fetchedAt_key" ON "exchange_rate"("baseCurrency", "targetCurrency", "fetchedAt");
