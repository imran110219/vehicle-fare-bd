/**
 * @jest-environment node
 */
jest.mock("next-auth", () => ({ getServerSession: jest.fn() }));
jest.mock("@/lib/auth", () => ({ authOptions: {} }));
jest.mock("@/lib/stats", () => ({ getCommunityStats: jest.fn() }));
jest.mock("@/lib/buckets", () => ({ getDistanceBucket: jest.fn() }));

import { GET } from "@/app/api/insights/route";
import { getServerSession } from "next-auth";
import { getCommunityStats } from "@/lib/stats";
import { getDistanceBucket } from "@/lib/buckets";

const mockSession = getServerSession as jest.Mock;
const mockGetStats = getCommunityStats as jest.Mock;
const mockGetBucket = getDistanceBucket as jest.Mock;

const validUrl =
  "http://localhost/api/insights?city=DHAKA&vehicleType=RICKSHAW&timeOfDay=MORNING&distanceKm=3";

describe("GET /api/insights (authenticated)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetBucket.mockReturnValue("KM_1_2");
  });

  it("returns 401 when no session", async () => {
    mockSession.mockResolvedValue(null);

    const res = await GET(new Request(validUrl));

    expect(res.status).toBe(401);
    expect(await res.json()).toMatchObject({ error: "Unauthorized" });
  });

  it("returns 401 when session has no user", async () => {
    mockSession.mockResolvedValue({ user: null });

    const res = await GET(new Request(validUrl));

    expect(res.status).toBe(401);
  });

  it("returns 400 when required params are missing", async () => {
    mockSession.mockResolvedValue({ user: { id: "1" } });

    const res = await GET(new Request("http://localhost/api/insights"));

    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ error: "Missing params" });
  });

  it("returns 400 when city is missing", async () => {
    mockSession.mockResolvedValue({ user: { id: "1" } });

    const url = "http://localhost/api/insights?vehicleType=RICKSHAW&timeOfDay=MORNING&distanceKm=3";
    const res = await GET(new Request(url));

    expect(res.status).toBe(400);
  });

  it("returns 400 when distanceKm is not a number", async () => {
    mockSession.mockResolvedValue({ user: { id: "1" } });

    const url = "http://localhost/api/insights?city=DHAKA&vehicleType=RICKSHAW&timeOfDay=MORNING&distanceKm=abc";
    const res = await GET(new Request(url));

    expect(res.status).toBe(400);
  });

  it("returns 200 with stats for authenticated user", async () => {
    mockSession.mockResolvedValue({ user: { id: "1" } });
    const stats = { medianFare: 120, iqrLow: 90, iqrHigh: 150, count: 8, updatedAt: new Date().toISOString() };
    mockGetStats.mockResolvedValue(stats);

    const res = await GET(new Request(validUrl));

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.medianFare).toBe(120);
    expect(json.count).toBe(8);
  });

  it("returns 200 with null when no community data", async () => {
    mockSession.mockResolvedValue({ user: { id: "1" } });
    mockGetStats.mockResolvedValue(null);

    const res = await GET(new Request(validUrl));

    expect(res.status).toBe(200);
    expect(await res.json()).toBeNull();
  });

  it("calls getDistanceBucket with the correct distanceKm", async () => {
    mockSession.mockResolvedValue({ user: { id: "1" } });
    mockGetStats.mockResolvedValue(null);

    await GET(new Request(validUrl));

    expect(mockGetBucket).toHaveBeenCalledWith(3);
  });

  it("calls getCommunityStats with correct args", async () => {
    mockSession.mockResolvedValue({ user: { id: "1" } });
    mockGetBucket.mockReturnValue("KM_1_2");
    mockGetStats.mockResolvedValue(null);

    await GET(new Request(validUrl));

    expect(mockGetStats).toHaveBeenCalledWith("DHAKA", "RICKSHAW", "KM_1_2", "MORNING");
  });
});
