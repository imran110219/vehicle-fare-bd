import { prisma } from "@/lib/prisma";

export async function getCachedGeocode(query: string) {
  const cached = await prisma.geocodeCache.findUnique({
    where: { query: query.toLowerCase() }
  });
  if (!cached) return null;
  return {
    lat: cached.lat,
    lng: cached.lng,
    displayName: cached.displayName
  };
}

export async function cacheGeocode(query: string, lat: number, lng: number, displayName: string) {
  return prisma.geocodeCache.upsert({
    where: { query: query.toLowerCase() },
    update: { lat, lng, displayName },
    create: { query: query.toLowerCase(), lat, lng, displayName }
  });
}
