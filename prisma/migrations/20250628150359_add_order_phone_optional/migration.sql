-- DropForeignKey
ALTER TABLE "cart_item" DROP CONSTRAINT "cart_item_variantId_fkey";

-- AlterTable
ALTER TABLE "cart_item" ALTER COLUMN "variantId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "order" ADD COLUMN     "phone" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "order_item" ALTER COLUMN "variantId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
