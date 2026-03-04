/**
 * @jest-environment node
 */
jest.mock("@/lib/stats", () => ({ getCommunityStatsPublic: jest.fn() }));
jest.mock("@/lib/buckets", () => ({ getDistanceBucket: jest.fn() }));

import { GET } from "@/app/api/insights/public/route";
import { getCommunityStatsPublic } from "@/lib/stats";
import { getDistanceBucket } from "@/lib/buckets";

const mockGetStats = getCommunityStatsPublic as jest.Mock;
const mockGetBucket = getDistanceBucket as jest.Mock;

const validUrl =
  "http://localhost/api/insights/public?city=DHAKA&vehicleType=RICKSHAW&timeOfDay=MORNING&distanceKm=3";

describe("GET /api/insights/public", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetBucket.mockReturnValue("KM_1_2");
  });

  it("returns 400 when all params are missing", async () => {
    const res = await GET(new Request("http://localhost/api/insights/public"));

    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ error: "Missing params" });
  });

  it("returns 400 when city is missing", async () => {
    const url = "http://localhost/api/insights/public?vehicleType=RICKSHAW&timeOfDay=MORNING&distanceKm=3";
    const res = await GET(new Request(url));

    expect(res.status).toBe(400);
  });

  it("returns 400 when vehicleType is missing", async () => {
    const url = "http://localhost/api/insights/public?city=DHAKA&timeOfDay=MORNING&distanceKm=3";
    const res = await GET(new Request(url));

    expect(res.status).toBe(400);
  });

  it("returns 400 when timeOfDay is missing", async () => {
    const url = "http://localhost/api/insights/public?city=DHAKA&vehicleType=RICKSHAW&distanceKm=3";
    const res = await GET(new Request(url));

    expect(res.status).toBe(400);
  });

  it("does NOT require authentication (no 401)", async () => {
    mockGetStats.mockResolvedValue(null);

    const res = await GET(new Request(validUrl));

    expect(res.status).not.toBe(401);
  });

  it("returns 200 with null when insufficient community data", async () => {
    mockGetStats.mockResolvedValue(null);

    const res = await GET(new Request(validUrl));

    expect(res.status).toBe(200);
    expect(await res.json()).toBeNull();
  });

  it("returns 200 with stats when enough data", async () => {
    const stats = { medianFare: 150, iqrLow: 120, iqrHigh: 180, count: 8, updatedAt: new Date().toISOString() };
    mockGetStats.mockResolvedValue(stats);

    const res = await GET(new Request(validUrl));

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.medianFare).toBe(150);
    expect(json.count).toBe(8);
  });

  it("calls getDistanceBucket with distanceKm", async () => {
    mockGetStats.mockResolvedValue(null);

    await GET(new Request(validUrl));

    expect(mockGetBucket).toHaveBeenCalledWith(3);
  });

  it("calls getCommunityStatsPublic with correct args", async () => {
    mockGetBucket.mockReturnValue("KM_1_2");
    mockGetStats.mockResolvedValue(null);

    await GET(new Request(validUrl));

    expect(mockGetStats).toHaveBeenCalledWith("DHAKA", "RICKSHAW", "KM_1_2", "MORNING");
  });
});
