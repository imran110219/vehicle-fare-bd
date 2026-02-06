-- Add estimated fare snapshot fields to FareReport
ALTER TABLE "FareReport"
ADD COLUMN "estimatedFareAtTime" INTEGER,
ADD COLUMN "estimatorVersion" TEXT NOT NULL DEFAULT 'v1';
