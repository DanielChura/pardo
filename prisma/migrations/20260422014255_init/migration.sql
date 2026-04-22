/*
  Warnings:

  - You are about to drop the `GlobalCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GlobalOption` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_GlobalOptionToProduct` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "GlobalOption" DROP CONSTRAINT "GlobalOption_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "_GlobalOptionToProduct" DROP CONSTRAINT "_GlobalOptionToProduct_A_fkey";

-- DropForeignKey
ALTER TABLE "_GlobalOptionToProduct" DROP CONSTRAINT "_GlobalOptionToProduct_B_fkey";

-- DropTable
DROP TABLE "GlobalCategory";

-- DropTable
DROP TABLE "GlobalOption";

-- DropTable
DROP TABLE "_GlobalOptionToProduct";

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Option" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "priceAdjustment" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "imageUrl" TEXT,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "Option_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- AddForeignKey
ALTER TABLE "Option" ADD CONSTRAINT "Option_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
