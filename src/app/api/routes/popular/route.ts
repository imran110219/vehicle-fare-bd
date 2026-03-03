import { NextResponse } from "next/server";
import { City, VehicleType } from "@prisma/client";
import { getPopularRoutes } from "@/lib/routes";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city") as City | null;
  const vehicleType = searchParams.get("vehicleType") as VehicleType | null;
  const limit = parseInt(searchParams.get("limit") || "50", 10);

  try {
    const routes = await getPopularRoutes({
      city: city || undefined,
      vehicleType: vehicleType || undefined,
      limit: Math.min(limit, 100), // Cap at 100
    });

    return NextResponse.json({
      routes,
      count: routes.length,
      filters: { city, vehicleType, limit },
    });
  } catch (error) {
    console.error("Error fetching popular routes:", error);
    return NextResponse.json(
      { error: "Failed to fetch popular routes" },
      { status: 500 }
    );
  }
}
