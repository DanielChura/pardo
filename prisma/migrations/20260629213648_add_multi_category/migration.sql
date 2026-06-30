/*
  Warnings:

  - Added the required column `category` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `displayText` to the `ProductVariant` table without a default value. This is not possible if the table is not empty.
  - You are about to drop the column `woodId` on the `ProductVariant` table. All the data in the column will be lost.
  - You are about to drop the column `woodName` on the `OrderItem` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Category" AS ENUM ('BED', 'LEASH', 'TOY');

-- DropForeignKey
ALTER TABLE "ProductVariant" DROP CONSTRAINT "ProductVariant_woodId_fkey";

-- DropIndex
DROP INDEX "ProductVariant_productId_woodId_key";

-- AlterTable
ALTER TABLE "Product" RENAME COLUMN "description" TO "details";
ALTER TABLE "Product" ADD COLUMN "care" TEXT;
ALTER TABLE "Product" ADD COLUMN "category" "Category" NOT NULL;

-- AlterTable
ALTER TABLE "ProductVariant" DROP COLUMN "woodId";
ALTER TABLE "ProductVariant" ADD COLUMN "displayText" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Wood" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "woodName";
ALTER TABLE "OrderItem" ADD COLUMN "variantDetailSnapshot" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ProductImage_productId_orderIndex_key" ON "ProductImage"("productId", "orderIndex");

-- CreateTable
CREATE TABLE "BedVariantDetail" (
    "id" TEXT NOT NULL,
    "productVariantId" TEXT NOT NULL,
    "woodId" TEXT NOT NULL,
    "size" "Size" NOT NULL,
    "fitRangeMin" INTEGER NOT NULL,
    "fitRangeMax" INTEGER NOT NULL,
    "lengthMm" INTEGER NOT NULL,
    "widthMm" INTEGER NOT NULL,
    "heightMm" INTEGER NOT NULL,
    "weightKg" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "BedVariantDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeashVariantDetail" (
    "id" TEXT NOT NULL,
    "productVariantId" TEXT NOT NULL,
    "lengthCm" INTEGER NOT NULL,
    "material" TEXT NOT NULL,

    CONSTRAINT "LeashVariantDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ToyVariantDetail" (
    "id" TEXT NOT NULL,
    "productVariantId" TEXT NOT NULL,
    "sizeLabel" TEXT NOT NULL,
    "material" TEXT NOT NULL,

    CONSTRAINT "ToyVariantDetail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BedVariantDetail_productVariantId_key" ON "BedVariantDetail"("productVariantId");

-- CreateIndex
CREATE UNIQUE INDEX "BedVariantDetail_productVariantId_woodId_size_key" ON "BedVariantDetail"("productVariantId", "woodId", "size");

-- CreateIndex
CREATE UNIQUE INDEX "LeashVariantDetail_productVariantId_key" ON "LeashVariantDetail"("productVariantId");

-- CreateIndex
CREATE UNIQUE INDEX "LeashVariantDetail_productVariantId_lengthCm_material_key" ON "LeashVariantDetail"("productVariantId", "lengthCm", "material");

-- CreateIndex
CREATE UNIQUE INDEX "ToyVariantDetail_productVariantId_key" ON "ToyVariantDetail"("productVariantId");

-- CreateIndex
CREATE UNIQUE INDEX "ToyVariantDetail_productVariantId_sizeLabel_material_key" ON "ToyVariantDetail"("productVariantId", "sizeLabel", "material");

-- AddForeignKey
ALTER TABLE "BedVariantDetail" ADD CONSTRAINT "BedVariantDetail_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BedVariantDetail" ADD CONSTRAINT "BedVariantDetail_woodId_fkey" FOREIGN KEY ("woodId") REFERENCES "Wood"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeashVariantDetail" ADD CONSTRAINT "LeashVariantDetail_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToyVariantDetail" ADD CONSTRAINT "ToyVariantDetail_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
