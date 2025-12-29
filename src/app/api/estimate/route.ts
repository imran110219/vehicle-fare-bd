import { NextResponse } from "next/server";
import { getDistanceKmWithFallback } from "@/lib/distance";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pickupLat = Number(searchParams.get("pickupLat"));
  const pickupLng = Number(searchParams.get("pickupLng"));
  const dropLat = Number(searchParams.get("dropLat"));
  const dropLng = Number(searchParams.get("dropLng"));

  if ([pickupLat, pickupLng, dropLat, dropLng].some((value) => Number.isNaN(value))) {
    return NextResponse.json({ error: "Missing coordinates" }, { status: 400 });
  }

  const result = await getDistanceKmWithFallback(
    { lat: pickupLat, lng: pickupLng },
    { lat: dropLat, lng: dropLng }
  );

  return NextResponse.json(result);
}
