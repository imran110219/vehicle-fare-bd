import { NextResponse } from "next/server";
import { City, TimeOfDay } from "@prisma/client";
import { getDistanceBucket } from "@/lib/buckets";
import { getCommunityStats } from "@/lib/stats";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city") as City | null;
  const timeOfDay = searchParams.get("timeOfDay") as TimeOfDay | null;
  const distanceKm = Number(searchParams.get("distanceKm"));

  if (!city || !timeOfDay || Number.isNaN(distanceKm)) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  const bucket = getDistanceBucket(distanceKm);
  const stats = await getCommunityStats(city, bucket, timeOfDay);

  return NextResponse.json(stats);
}
