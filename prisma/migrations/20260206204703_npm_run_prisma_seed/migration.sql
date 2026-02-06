-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "City" ADD VALUE 'BARISHAL';
ALTER TYPE "City" ADD VALUE 'BOGURA';
ALTER TYPE "City" ADD VALUE 'CUMILLA';
ALTER TYPE "City" ADD VALUE 'DINAJPUR';
ALTER TYPE "City" ADD VALUE 'FENI';
ALTER TYPE "City" ADD VALUE 'GAZIPUR';
ALTER TYPE "City" ADD VALUE 'JASHORE';
ALTER TYPE "City" ADD VALUE 'KUSHTIA';
ALTER TYPE "City" ADD VALUE 'MYMENSINGH';
ALTER TYPE "City" ADD VALUE 'NARAYANGANJ';
ALTER TYPE "City" ADD VALUE 'NOAKHALI';
ALTER TYPE "City" ADD VALUE 'PABNA';
ALTER TYPE "City" ADD VALUE 'RAJSHAHI';
ALTER TYPE "City" ADD VALUE 'RANGPUR';
ALTER TYPE "City" ADD VALUE 'SAVAR';
ALTER TYPE "City" ADD VALUE 'TANGAIL';
