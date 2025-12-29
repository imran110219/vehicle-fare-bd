import { DistanceBucket } from "@prisma/client";

export function getDistanceBucket(distanceKm: number): DistanceBucket {
  if (distanceKm <= 1) return DistanceBucket.KM_0_1;
  if (distanceKm <= 2) return DistanceBucket.KM_1_2;
  if (distanceKm <= 3) return DistanceBucket.KM_2_3;
  if (distanceKm <= 5) return DistanceBucket.KM_3_5;
  if (distanceKm <= 8) return DistanceBucket.KM_5_8;
  return DistanceBucket.KM_8_PLUS;
}

export function formatBucket(bucket: DistanceBucket) {
  switch (bucket) {
    case DistanceBucket.KM_0_1:
      return "0-1 km";
    case DistanceBucket.KM_1_2:
      return "1-2 km";
    case DistanceBucket.KM_2_3:
      return "2-3 km";
    case DistanceBucket.KM_3_5:
      return "3-5 km";
    case DistanceBucket.KM_5_8:
      return "5-8 km";
    case DistanceBucket.KM_8_PLUS:
      return "8+ km";
    default:
      return "Unknown";
  }
}
