/*
  Warnings:

  - You are about to drop the `VariantCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VariantOption` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "VariantCategory" DROP CONSTRAINT "VariantCategory_productId_fkey";

-- DropForeignKey
ALTER TABLE "VariantOption" DROP CONSTRAINT "VariantOption_categoryId_fkey";

-- DropTable
DROP TABLE "VariantCategory";

-- DropTable
DROP TABLE "VariantOption";

-- CreateTable
CREATE TABLE "GlobalCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "GlobalCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GlobalOption" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "priceAdjustment" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "imageUrl" TEXT,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "GlobalOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_GlobalOptionToProduct" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_GlobalOptionToProduct_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "GlobalCategory_name_key" ON "GlobalCategory"("name");

-- CreateIndex
CREATE INDEX "_GlobalOptionToProduct_B_index" ON "_GlobalOptionToProduct"("B");

-- AddForeignKey
ALTER TABLE "GlobalOption" ADD CONSTRAINT "GlobalOption_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "GlobalCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GlobalOptionToProduct" ADD CONSTRAINT "_GlobalOptionToProduct_A_fkey" FOREIGN KEY ("A") REFERENCES "GlobalOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GlobalOptionToProduct" ADD CONSTRAINT "_GlobalOptionToProduct_B_fkey" FOREIGN KEY ("B") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
