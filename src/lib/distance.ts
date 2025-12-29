export type LatLng = { lat: number; lng: number };

const EARTH_RADIUS_KM = 6371;

export function haversineDistanceKm(a: LatLng, b: LatLng) {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

export function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

export async function getDistanceKmWithFallback(
  pickup: LatLng,
  drop: LatLng
): Promise<{ distanceKm: number; note: string }> {
  const allowOsrm = process.env.ALLOW_OSRM === "true";
  if (allowOsrm) {
    try {
      const res = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${pickup.lng},${pickup.lat};${drop.lng},${drop.lat}?overview=false`
      );
      if (res.ok) {
        const data = await res.json();
        const meters = data?.routes?.[0]?.distance;
        if (typeof meters === "number") {
          return { distanceKm: meters / 1000, note: "OSRM routing estimate" };
        }
      }
    } catch (error) {
      return {
        distanceKm: haversineDistanceKm(pickup, drop),
        note: "Straight-line estimate used (OSRM unavailable)"
      };
    }
  }

  return {
    distanceKm: haversineDistanceKm(pickup, drop),
    note: "Straight-line estimate used"
  };
}
