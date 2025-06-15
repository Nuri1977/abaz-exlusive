-- CreateTable
CREATE TABLE "gallery" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "lastModified" INTEGER NOT NULL,
    "serverData" JSONB NOT NULL,
    "url" TEXT NOT NULL,
    "appUrl" TEXT NOT NULL,
    "ufsUrl" TEXT NOT NULL,
    "customId" TEXT,
    "type" TEXT NOT NULL,
    "fileHash" TEXT NOT NULL,
    "reference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB DEFAULT '{}',

    CONSTRAINT "gallery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "gallery_key_key" ON "gallery"("key");
