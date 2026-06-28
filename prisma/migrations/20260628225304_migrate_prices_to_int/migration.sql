/*
  Warnings:

  - You are about to alter the column `price` on the `Fabric` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `subtotal` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `total` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `unitWoodPrice` on the `OrderItem` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `unitFabricPrice` on the `OrderItem` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `unitTotalPrice` on the `OrderItem` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `price` on the `ProductVariant` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Fabric" ALTER COLUMN "price" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "subtotal" SET DATA TYPE INTEGER,
ALTER COLUMN "total" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "OrderItem" ALTER COLUMN "unitWoodPrice" SET DATA TYPE INTEGER,
ALTER COLUMN "unitFabricPrice" SET DATA TYPE INTEGER,
ALTER COLUMN "unitTotalPrice" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "ProductVariant" ALTER COLUMN "price" SET DATA TYPE INTEGER;
