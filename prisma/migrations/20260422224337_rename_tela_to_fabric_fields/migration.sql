/*
  Warnings:

  - You are about to drop the column `telaId` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `telaName` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `unitTelaPrice` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the `Tela` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `unitFabricPrice` to the `OrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_telaId_fkey";

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "telaId",
DROP COLUMN "telaName",
DROP COLUMN "unitTelaPrice",
ADD COLUMN     "fabricId" TEXT,
ADD COLUMN     "fabricName" TEXT,
ADD COLUMN     "unitFabricPrice" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "imagePublicId" TEXT;

-- AlterTable
ALTER TABLE "Wood" ADD COLUMN     "imagePublicId" TEXT;

-- DropTable
DROP TABLE "Tela";

-- CreateTable
CREATE TABLE "Fabric" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "stock" INTEGER NOT NULL,
    "imageUrl" TEXT,
    "imagePublicId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Fabric_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_fabricId_fkey" FOREIGN KEY ("fabricId") REFERENCES "Fabric"("id") ON DELETE SET NULL ON UPDATE CASCADE;
