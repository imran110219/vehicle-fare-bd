import { City, DistanceBucket, TimeOfDay, VehicleType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const CACHE_MINUTES = 10;

function isFresh(updatedAt: Date) {
  const cutoff = Date.now() - CACHE_MINUTES * 60 * 1000;
  return updatedAt.getTime() >= cutoff;
}

export async function getCommunityStats(
  city: City,
  vehicleType: VehicleType,
  bucket: DistanceBucket,
  timeOfDay: TimeOfDay
) {
  const cached = await prisma.distanceBucketStat.findUnique({
    where: { city_vehicleType_bucket_timeOfDay: { city, vehicleType, bucket, timeOfDay } }
  });
  if (cached && isFresh(cached.updatedAt)) {
    return cached;
  }

  const reports = await prisma.fareReport.findMany({
    where: { city, vehicleType, timeOfDay, distanceKm: bucketFilter(bucket) },
    select: { farePaid: true }
  });

  if (reports.length === 0) {
    return null;
  }

  const values = reports.map((r) => r.farePaid).sort((a, b) => a - b);
  const medianFare = percentile(values, 0.5);
  const iqrLow = percentile(values, 0.25);
  const iqrHigh = percentile(values, 0.75);

  const stat = await prisma.distanceBucketStat.upsert({
    where: { city_vehicleType_bucket_timeOfDay: { city, vehicleType, bucket, timeOfDay } },
    update: { medianFare, iqrLow, iqrHigh, count: values.length },
    create: { city, vehicleType, bucket, timeOfDay, medianFare, iqrLow, iqrHigh, count: values.length }
  });

  return stat;
}

export function bucketFilter(bucket: DistanceBucket) {
  switch (bucket) {
    case DistanceBucket.KM_0_1:
      return { gte: 0, lte: 1 };
    case DistanceBucket.KM_1_2:
      return { gt: 1, lte: 2 };
    case DistanceBucket.KM_2_3:
      return { gt: 2, lte: 3 };
    case DistanceBucket.KM_3_5:
      return { gt: 3, lte: 5 };
    case DistanceBucket.KM_5_8:
      return { gt: 5, lte: 8 };
    case DistanceBucket.KM_8_PLUS:
      return { gt: 8 };
    default:
      return { gte: 0 };
  }
}

function percentile(values: number[], p: number) {
  if (values.length === 0) return 0;
  const index = (values.length - 1) * p;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return values[lower];
  return values[lower] + (values[upper] - values[lower]) * (index - lower);
}
