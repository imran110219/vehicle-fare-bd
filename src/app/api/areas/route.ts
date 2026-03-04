import { NextResponse } from "next/server";
import { City } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const revalidate = 300; // cache 5 minutes

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city") as City | null;

  if (!city || !Object.values(City).includes(city)) {
    return NextResponse.json({ error: "Missing or invalid city" }, { status: 400 });
  }

  const [pickups, drops] = await Promise.all([
    prisma.fareReport.findMany({
      where: { city },
      select: { pickupArea: true },
      distinct: ["pickupArea"],
    }),
    prisma.fareReport.findMany({
      where: { city },
      select: { dropArea: true },
      distinct: ["dropArea"],
    }),
  ]);

  const areas = [
    ...new Set([
      ...pickups.map((r) => r.pickupArea),
      ...drops.map((r) => r.dropArea),
    ]),
  ].sort();

  return NextResponse.json({ areas });
}
