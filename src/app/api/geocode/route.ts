import { NextResponse } from "next/server";
import { getCachedGeocode, cacheGeocode } from "@/lib/geocode";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  if (!query) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  const cached = await getCachedGeocode(query);
  if (cached) {
    return NextResponse.json(cached);
  }

  if (process.env.ALLOW_NOMINATIM !== "true") {
    return NextResponse.json({ error: "Geocoding disabled" }, { status: 503 });
  }

  const baseUrl = process.env.NOMINATIM_BASE_URL || "https://nominatim.openstreetmap.org";
  const res = await fetch(
    `${baseUrl}/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
    { headers: { "User-Agent": "rickshaw-fare-checker" } }
  );

  if (!res.ok) {
    return NextResponse.json({ error: "Geocoding failed" }, { status: 500 });
  }

  const data = await res.json();
  const first = data?.[0];
  if (!first) {
    return NextResponse.json({ error: "No results" }, { status: 404 });
  }

  const lat = Number(first.lat);
  const lng = Number(first.lon);
  const displayName = first.display_name as string;

  await cacheGeocode(query, lat, lng, displayName);

  return NextResponse.json({ lat, lng, displayName });
}
