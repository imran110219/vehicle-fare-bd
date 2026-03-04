-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "City" AS ENUM ('BARISHAL', 'BOGURA', 'CHATTOGRAM', 'CUMILLA', 'DHAKA', 'DINAJPUR', 'FENI', 'GAZIPUR', 'JASHORE', 'KHULNA', 'KUSHTIA', 'MYMENSINGH', 'NARAYANGANJ', 'NOAKHALI', 'PABNA', 'RAJSHAHI', 'RANGPUR', 'SAVAR', 'SYLHET', 'TANGAIL', 'OTHER');

-- CreateEnum
CREATE TYPE "TimeOfDay" AS ENUM ('MORNING', 'AFTERNOON', 'EVENING', 'NIGHT');

-- CreateEnum
CREATE TYPE "Weather" AS ENUM ('CLEAR', 'RAIN');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('RICKSHAW', 'CNG', 'AUTO_RICKSHAW', 'BIKE', 'CAR', 'MICROBUS', 'BUS', 'OTHER');

-- CreateEnum
CREATE TYPE "NegotiationDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "DistanceBucket" AS ENUM ('KM_0_1', 'KM_1_2', 'KM_2_3', 'KM_3_5', 'KM_5_8', 'KM_8_PLUS');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "passwordHash" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

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

-- CreateTable
CREATE TABLE "FareReport" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "city" "City" NOT NULL,
    "vehicleType" "VehicleType" NOT NULL,
    "pickupArea" TEXT NOT NULL,
    "dropArea" TEXT NOT NULL,
    "distanceKm" DOUBLE PRECISION NOT NULL,
    "farePaid" INTEGER NOT NULL,
    "estimatedFareAtTime" INTEGER,
    "estimatorVersion" TEXT NOT NULL DEFAULT 'v1',
    "seedKey" TEXT,
    "timeOfDay" "TimeOfDay" NOT NULL,
    "weather" "Weather",
    "passengerCount" INTEGER NOT NULL,
    "luggage" BOOLEAN NOT NULL,
    "traffic" BOOLEAN NOT NULL,
    "negotiation" "NegotiationDifficulty" NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FareReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DistanceBucketStat" (
    "id" TEXT NOT NULL,
    "city" "City" NOT NULL,
    "vehicleType" "VehicleType" NOT NULL,
    "bucket" "DistanceBucket" NOT NULL,
    "timeOfDay" "TimeOfDay" NOT NULL,
    "medianFare" DOUBLE PRECISION NOT NULL,
    "iqrLow" DOUBLE PRECISION NOT NULL,
    "iqrHigh" DOUBLE PRECISION NOT NULL,
    "count" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DistanceBucketStat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "VehicleFareConfig_city_idx" ON "VehicleFareConfig"("city");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleFareConfig_city_vehicleType_key" ON "VehicleFareConfig"("city", "vehicleType");

-- CreateIndex
CREATE UNIQUE INDEX "FareReport_seedKey_key" ON "FareReport"("seedKey");

-- CreateIndex
CREATE INDEX "FareReport_city_createdAt_idx" ON "FareReport"("city", "createdAt");

-- CreateIndex
CREATE INDEX "FareReport_city_distanceKm_idx" ON "FareReport"("city", "distanceKm");

-- CreateIndex
CREATE UNIQUE INDEX "DistanceBucketStat_city_vehicleType_bucket_timeOfDay_key" ON "DistanceBucketStat"("city", "vehicleType", "bucket", "timeOfDay");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FareReport" ADD CONSTRAINT "FareReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
