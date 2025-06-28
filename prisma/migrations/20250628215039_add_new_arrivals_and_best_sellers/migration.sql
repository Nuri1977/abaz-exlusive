-- CreateTable
CREATE TABLE "new_arrivals" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "new_arrivals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "best_sellers" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "best_sellers_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "new_arrivals" ADD CONSTRAINT "new_arrivals_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "best_sellers" ADD CONSTRAINT "best_sellers_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
