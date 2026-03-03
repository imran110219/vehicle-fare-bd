import { prisma } from "./prisma";
import type { City, VehicleType } from "@prisma/client";

export type PopularRoute = {
  pickupArea: string;
  dropArea: string;
  city: City;
  vehicleType: VehicleType;
  tripCount: number;
  medianFare: number;
  minFare: number;
  maxFare: number;
  avgDistance: number;
  lastReported: Date;
};

export type PopularRoutesFilters = {
  city?: City;
  vehicleType?: VehicleType;
  limit?: number;
};

/**
 * Get popular routes based on frequency of submissions
 * Groups by city, vehicleType, pickupArea, and dropArea
 * Returns aggregated statistics for each route
 */
export async function getPopularRoutes(
  filters: PopularRoutesFilters = {}
): Promise<PopularRoute[]> {
  const { city, vehicleType, limit = 50 } = filters;

  // Build where clause
  const where: {
    city?: City;
    vehicleType?: VehicleType;
  } = {};

  if (city) where.city = city;
  if (vehicleType) where.vehicleType = vehicleType;

  // Query to find most common routes with aggregated stats
  const routes = await prisma.fareReport.groupBy({
    by: ["city", "vehicleType", "pickupArea", "dropArea"],
    where,
    _count: {
      id: true,
    },
    _avg: {
      farePaid: true,
      distanceKm: true,
    },
    _min: {
      farePaid: true,
    },
    _max: {
      farePaid: true,
      createdAt: true,
    },
    orderBy: {
      _count: {
        id: "desc",
      },
    },
    take: limit,
    // Only show routes with at least 3 reports for reliability
    having: {
      id: {
        _count: {
          gte: 3,
        },
      },
    },
  });

  // Calculate median fare for each route
  const popularRoutes: PopularRoute[] = await Promise.all(
    routes.map(async (route) => {
      // Get all fares for this route to calculate median
      const fares = await prisma.fareReport.findMany({
        where: {
          city: route.city,
          vehicleType: route.vehicleType,
          pickupArea: route.pickupArea,
          dropArea: route.dropArea,
        },
        select: {
          farePaid: true,
        },
        orderBy: {
          farePaid: "asc",
        },
      });

      const sortedFares = fares.map((f) => f.farePaid).sort((a, b) => a - b);
      const medianFare = calculateMedian(sortedFares);

      return {
        pickupArea: route.pickupArea,
        dropArea: route.dropArea,
        city: route.city,
        vehicleType: route.vehicleType,
        tripCount: route._count.id,
        medianFare: Math.round(medianFare),
        minFare: route._min.farePaid || 0,
        maxFare: route._max.farePaid || 0,
        avgDistance: route._avg.distanceKm || 0,
        lastReported: route._max.createdAt || new Date(),
      };
    })
  );

  return popularRoutes;
}

/**
 * Get popular routes for a specific city
 */
export async function getPopularRoutesByCity(
  city: City,
  limit = 20
): Promise<PopularRoute[]> {
  return getPopularRoutes({ city, limit });
}

/**
 * Get top routes across all cities (for homepage)
 */
export async function getTopRoutes(limit = 10): Promise<PopularRoute[]> {
  return getPopularRoutes({ limit });
}

/**
 * Calculate median from sorted array
 */
function calculateMedian(sortedValues: number[]): number {
  if (sortedValues.length === 0) return 0;

  const mid = Math.floor(sortedValues.length / 2);

  if (sortedValues.length % 2 === 0) {
    return (sortedValues[mid - 1] + sortedValues[mid]) / 2;
  }

  return sortedValues[mid];
}

/**
 * Search for a specific route
 */
export async function searchRoute(
  city: City,
  vehicleType: VehicleType,
  pickupArea: string,
  dropArea: string
): Promise<PopularRoute | null> {
  const reports = await prisma.fareReport.findMany({
    where: {
      city,
      vehicleType,
      pickupArea: {
        contains: pickupArea,
        mode: "insensitive",
      },
      dropArea: {
        contains: dropArea,
        mode: "insensitive",
      },
    },
    select: {
      farePaid: true,
      distanceKm: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (reports.length < 3) return null;

  const fares = reports.map((r) => r.farePaid).sort((a, b) => a - b);
  const distances = reports.map((r) => r.distanceKm);

  return {
    pickupArea,
    dropArea,
    city,
    vehicleType,
    tripCount: reports.length,
    medianFare: Math.round(calculateMedian(fares)),
    minFare: Math.min(...fares),
    maxFare: Math.max(...fares),
    avgDistance: distances.reduce((a, b) => a + b, 0) / distances.length,
    lastReported: reports[0].createdAt,
  };
}
