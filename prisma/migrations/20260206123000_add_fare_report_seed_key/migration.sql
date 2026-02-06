-- Add seedKey for idempotent fare report seeding
ALTER TABLE "FareReport"
ADD COLUMN "seedKey" TEXT;

CREATE UNIQUE INDEX "FareReport_seedKey_key" ON "FareReport"("seedKey");
