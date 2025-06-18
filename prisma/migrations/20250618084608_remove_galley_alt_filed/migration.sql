/*
  Warnings:

  - The `images` column on the `product` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `metadata` on table `gallery` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "gallery" ADD COLUMN     "height" INTEGER,
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "uploadedBy" TEXT,
ADD COLUMN     "usedIn" JSONB[],
ADD COLUMN     "width" INTEGER,
ALTER COLUMN "metadata" SET NOT NULL,
ALTER COLUMN "metadata" DROP DEFAULT;

-- AlterTable
ALTER TABLE "product" DROP COLUMN "images",
ADD COLUMN     "images" JSONB[];

-- CreateTable
CREATE TABLE "media_usage" (
    "id" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_usage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "media_usage_mediaId_entityId_entityType_key" ON "media_usage"("mediaId", "entityId", "entityType");
