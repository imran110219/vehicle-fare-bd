/**
 * @jest-environment node
 */
jest.mock("@/lib/routes", () => ({ getPopularRoutes: jest.fn() }));

import { GET } from "@/app/api/routes/popular/route";
import { getPopularRoutes } from "@/lib/routes";

const mockGetRoutes = getPopularRoutes as jest.Mock;

const sampleRoute = {
  pickupArea: "Mirpur",
  dropArea: "Dhanmondi",
  city: "DHAKA",
  vehicleType: "CNG",
  tripCount: 5,
  medianFare: 150,
  minFare: 120,
  maxFare: 180,
  avgDistance: 5.2,
  lastReported: new Date().toISOString(),
};

describe("GET /api/routes/popular", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 200 with empty routes when no data", async () => {
    mockGetRoutes.mockResolvedValue([]);

    const res = await GET(new Request("http://localhost/api/routes/popular"));

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.routes).toEqual([]);
    expect(json.count).toBe(0);
  });

  it("returns routes with count", async () => {
    mockGetRoutes.mockResolvedValue([sampleRoute]);

    const res = await GET(new Request("http://localhost/api/routes/popular"));

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.routes).toHaveLength(1);
    expect(json.count).toBe(1);
    expect(json.routes[0].pickupArea).toBe("Mirpur");
  });

  it("passes city filter to getPopularRoutes", async () => {
    mockGetRoutes.mockResolvedValue([]);

    await GET(new Request("http://localhost/api/routes/popular?city=DHAKA"));

    expect(mockGetRoutes).toHaveBeenCalledWith(
      expect.objectContaining({ city: "DHAKA" })
    );
  });

  it("passes vehicleType filter to getPopularRoutes", async () => {
    mockGetRoutes.mockResolvedValue([]);

    await GET(new Request("http://localhost/api/routes/popular?vehicleType=RICKSHAW"));

    expect(mockGetRoutes).toHaveBeenCalledWith(
      expect.objectContaining({ vehicleType: "RICKSHAW" })
    );
  });

  it("uses default limit of 50", async () => {
    mockGetRoutes.mockResolvedValue([]);

    await GET(new Request("http://localhost/api/routes/popular"));

    expect(mockGetRoutes).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 50 })
    );
  });

  it("caps limit at 100 when higher value is requested", async () => {
    mockGetRoutes.mockResolvedValue([]);

    await GET(new Request("http://localhost/api/routes/popular?limit=200"));

    expect(mockGetRoutes).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 100 })
    );
  });

  it("passes custom limit when within bounds", async () => {
    mockGetRoutes.mockResolvedValue([]);

    await GET(new Request("http://localhost/api/routes/popular?limit=25"));

    expect(mockGetRoutes).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 25 })
    );
  });

  it("includes filters in response body", async () => {
    mockGetRoutes.mockResolvedValue([]);

    const res = await GET(
      new Request("http://localhost/api/routes/popular?city=DHAKA&vehicleType=CNG&limit=20")
    );
    const json = await res.json();

    expect(json.filters).toEqual({ city: "DHAKA", vehicleType: "CNG", limit: 20 });
  });

  it("passes undefined city/vehicleType when not provided", async () => {
    mockGetRoutes.mockResolvedValue([]);

    await GET(new Request("http://localhost/api/routes/popular"));

    expect(mockGetRoutes).toHaveBeenCalledWith(
      expect.objectContaining({ city: undefined, vehicleType: undefined })
    );
  });

  it("returns 500 when getPopularRoutes throws", async () => {
    mockGetRoutes.mockRejectedValue(new Error("DB connection failed"));

    const res = await GET(new Request("http://localhost/api/routes/popular"));

    expect(res.status).toBe(500);
    expect(await res.json()).toMatchObject({ error: "Failed to fetch popular routes" });
  });
});
