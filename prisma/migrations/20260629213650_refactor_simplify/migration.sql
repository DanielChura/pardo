/*
  Warnings:

  - You are about to drop the `Wood` table. All the data in the column will be lost.
  - You are about to drop the `BedVariantDetail` table. All the data in the column will be lost.
  - You are about to drop the `LeashVariantDetail` table. All the data in the column will be lost.
  - You are about to drop the `ToyVariantDetail` table. All the data in the column will be lost.
  - You are about to drop the `Fabric` table. All the data in the column will be lost.
  - You are about to drop the column `fabricId` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `fabricName` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `unitWoodPrice` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `unitFabricPrice` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `unitTotalPrice` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `variantDetailSnapshot` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to alter the column `category` on the `Product` table. The data in that column could be lost.
  - Added the required column `categoryId` to the `Product` table without a default value (will fail if data exists).
  - Added the required column `variantDisplayText` to the `OrderItem` table without a default value.
  - Added the required column `unitPrice` to the `OrderItem` table without a default value.
  - Added the required column `materialName` to the `OrderItem` table without a default value if materialId is provided.
  - Added `attributes` column to `ProductVariant`.

*/

-- CreateEnum (no new enums needed, just altering existing)

-- Create Category table
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- Create Material table
CREATE TABLE "Material" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT,
    "imagePublicId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Material_pkey" PRIMARY KEY ("id")
);

-- Drop old tables
DROP TABLE "ToyVariantDetail";
DROP TABLE "LeashVariantDetail";
DROP TABLE "BedVariantDetail";
DROP TABLE "Wood";
DROP TABLE "Fabric";

-- Drop old enums
DROP TYPE IF EXISTS "Size";

-- Alter Product: replace category enum with categoryId FK
ALTER TABLE "Product" DROP COLUMN "category";
ALTER TABLE "Product" ADD COLUMN "categoryId" TEXT NOT NULL;
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Alter ProductVariant: add attributes
ALTER TABLE "ProductVariant" ADD COLUMN "attributes" JSONB;

-- Alter OrderItem
ALTER TABLE "OrderItem" DROP COLUMN "fabricId";
ALTER TABLE "OrderItem" DROP COLUMN "fabricName";
ALTER TABLE "OrderItem" DROP COLUMN "unitWoodPrice";
ALTER TABLE "OrderItem" DROP COLUMN "unitFabricPrice";
ALTER TABLE "OrderItem" DROP COLUMN "unitTotalPrice";
ALTER TABLE "OrderItem" DROP COLUMN "variantDetailSnapshot";
ALTER TABLE "OrderItem" ADD COLUMN "materialId" TEXT;
ALTER TABLE "OrderItem" ADD COLUMN "materialName" TEXT;
ALTER TABLE "OrderItem" ADD COLUMN "variantDisplayText" TEXT NOT NULL DEFAULT '';
ALTER TABLE "OrderItem" ADD COLUMN "variantAttributes" JSONB;
ALTER TABLE "OrderItem" ADD COLUMN "unitPrice" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "OrderItem" ALTER COLUMN "variantDisplayText" DROP DEFAULT;
ALTER TABLE "OrderItem" ALTER COLUMN "unitPrice" DROP DEFAULT;
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE SET NULL ON UPDATE CASCADE;
