/*
  Warnings:

  - You are about to drop the column `dropLat` on the `FareReport` table. All the data in the column will be lost.
  - You are about to drop the column `dropLng` on the `FareReport` table. All the data in the column will be lost.
  - You are about to drop the column `pickupLat` on the `FareReport` table. All the data in the column will be lost.
  - You are about to drop the column `pickupLng` on the `FareReport` table. All the data in the column will be lost.
  - You are about to drop the `CityConfig` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GeocodeCache` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[city,vehicleType,bucket,timeOfDay]` on the table `DistanceBucketStat` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `vehicleType` to the `DistanceBucketStat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vehicleType` to the `FareReport` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('RICKSHAW', 'CNG', 'AUTO_RICKSHAW', 'BIKE', 'CAR', 'MICROBUS', 'BUS', 'OTHER');

-- DropIndex
DROP INDEX "DistanceBucketStat_city_bucket_timeOfDay_key";

-- AlterTable
ALTER TABLE "DistanceBucketStat" ADD COLUMN     "vehicleType" "VehicleType" NOT NULL;

-- AlterTable
ALTER TABLE "FareReport" DROP COLUMN "dropLat",
DROP COLUMN "dropLng",
DROP COLUMN "pickupLat",
DROP COLUMN "pickupLng",
ADD COLUMN     "vehicleType" "VehicleType" NOT NULL;

-- DropTable
DROP TABLE "CityConfig";

-- DropTable
DROP TABLE "GeocodeCache";

-- CreateTable
CREATE TABLE "VehicleFareConfig" (
    "id" TEXT NOT NULL,
    "city" "City" NOT NULL,
    "vehicleType" "VehicleType" NOT NULL,
    "baseFare" INTEGER NOT NULL,
    "perKmRate" INTEGER NOT NULL,
    "morningMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "afternoonMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "eveningMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "nightMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.15,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VehicleFareConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VehicleFareConfig_city_idx" ON "VehicleFareConfig"("city");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleFareConfig_city_vehicleType_key" ON "VehicleFareConfig"("city", "vehicleType");

-- CreateIndex
CREATE UNIQUE INDEX "DistanceBucketStat_city_vehicleType_bucket_timeOfDay_key" ON "DistanceBucketStat"("city", "vehicleType", "bucket", "timeOfDay");
