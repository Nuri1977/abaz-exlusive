-- CreateTable
CREATE TABLE "promo_banners" (
    "id" TEXT NOT NULL,
    "collectionId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "promo_banners_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "promo_banners_collectionId_key" ON "promo_banners"("collectionId");

-- AddForeignKey
ALTER TABLE "promo_banners" ADD CONSTRAINT "promo_banners_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "collection"("id") ON DELETE SET NULL ON UPDATE CASCADE;
