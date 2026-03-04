jest.mock("@/lib/prisma", () => ({
  prisma: {
    distanceBucketStat: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
    fareReport: {
      findMany: jest.fn(),
    },
  },
}));

import { bucketFilter, getCommunityStats, getCommunityStatsPublic } from "@/lib/stats";
import { DistanceBucket } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const mockFindUnique = prisma.distanceBucketStat.findUnique as jest.Mock;
const mockFareReportFindMany = prisma.fareReport.findMany as jest.Mock;
const mockUpsert = prisma.distanceBucketStat.upsert as jest.Mock;

// ---------------------------------------------------------------------------
// bucketFilter
// ---------------------------------------------------------------------------
describe("bucketFilter", () => {
  it("KM_0_1 → gte 0, lte 1", () => {
    expect(bucketFilter(DistanceBucket.KM_0_1)).toEqual({ gte: 0, lte: 1 });
  });
  it("KM_1_2 → gt 1, lte 2", () => {
    expect(bucketFilter(DistanceBucket.KM_1_2)).toEqual({ gt: 1, lte: 2 });
  });
  it("KM_2_3 → gt 2, lte 3", () => {
    expect(bucketFilter(DistanceBucket.KM_2_3)).toEqual({ gt: 2, lte: 3 });
  });
  it("KM_3_5 → gt 3, lte 5", () => {
    expect(bucketFilter(DistanceBucket.KM_3_5)).toEqual({ gt: 3, lte: 5 });
  });
  it("KM_5_8 → gt 5, lte 8", () => {
    expect(bucketFilter(DistanceBucket.KM_5_8)).toEqual({ gt: 5, lte: 8 });
  });
  it("KM_8_PLUS → gt 8 (no upper bound)", () => {
    expect(bucketFilter(DistanceBucket.KM_8_PLUS)).toEqual({ gt: 8 });
  });
});

// ---------------------------------------------------------------------------
// getCommunityStats
// ---------------------------------------------------------------------------
describe("getCommunityStats", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns cached result immediately when fresh", async () => {
    const cached = {
      id: "1",
      medianFare: 100,
      iqrLow: 80,
      iqrHigh: 120,
      count: 10,
      updatedAt: new Date(), // just now → fresh
    };
    mockFindUnique.mockResolvedValue(cached);

    const result = await getCommunityStats("DHAKA", "RICKSHAW", DistanceBucket.KM_1_2, "MORNING");

    expect(result).toBe(cached);
    expect(mockFareReportFindMany).not.toHaveBeenCalled();
  });

  it("recomputes when cache is stale (>10 min old)", async () => {
    mockFindUnique.mockResolvedValue({
      updatedAt: new Date(Date.now() - 11 * 60 * 1000), // 11 min ago → stale
    });
    mockFareReportFindMany.mockResolvedValue([
      { farePaid: 80 },
      { farePaid: 100 },
      { farePaid: 120 },
    ]);
    const freshStat = { medianFare: 100, iqrLow: 85, iqrHigh: 115, count: 3, updatedAt: new Date() };
    mockUpsert.mockResolvedValue(freshStat);

    const result = await getCommunityStats("DHAKA", "RICKSHAW", DistanceBucket.KM_1_2, "MORNING");

    expect(mockFareReportFindMany).toHaveBeenCalled();
    expect(mockUpsert).toHaveBeenCalled();
    expect(result).toBe(freshStat);
  });

  it("returns null when no cache and no reports", async () => {
    mockFindUnique.mockResolvedValue(null);
    mockFareReportFindMany.mockResolvedValue([]);

    const result = await getCommunityStats("DHAKA", "RICKSHAW", DistanceBucket.KM_1_2, "MORNING");

    expect(result).toBeNull();
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it("returns null when stale cache and no reports", async () => {
    mockFindUnique.mockResolvedValue({ updatedAt: new Date(0) });
    mockFareReportFindMany.mockResolvedValue([]);

    const result = await getCommunityStats("DHAKA", "RICKSHAW", DistanceBucket.KM_1_2, "MORNING");

    expect(result).toBeNull();
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it("calculates correct median from reports", async () => {
    mockFindUnique.mockResolvedValue(null);
    // 5 sorted values: 100,200,300,400,500 → median=300
    mockFareReportFindMany.mockResolvedValue([
      { farePaid: 300 },
      { farePaid: 100 },
      { farePaid: 500 },
      { farePaid: 200 },
      { farePaid: 400 },
    ]);
    mockUpsert.mockImplementation(({ update }) =>
      Promise.resolve({ ...update, id: "new", updatedAt: new Date() })
    );

    await getCommunityStats("DHAKA", "RICKSHAW", DistanceBucket.KM_1_2, "MORNING");

    const { update } = mockUpsert.mock.calls[0][0];
    expect(update.medianFare).toBe(300);
    expect(update.count).toBe(5);
  });

  it("upserts with correct create fields when no prior cache", async () => {
    mockFindUnique.mockResolvedValue(null);
    mockFareReportFindMany.mockResolvedValue([{ farePaid: 100 }, { farePaid: 200 }]);
    mockUpsert.mockResolvedValue({ medianFare: 150, count: 2, updatedAt: new Date() });

    await getCommunityStats("DHAKA", "RICKSHAW", DistanceBucket.KM_1_2, "MORNING");

    const { create } = mockUpsert.mock.calls[0][0];
    expect(create.city).toBe("DHAKA");
    expect(create.vehicleType).toBe("RICKSHAW");
    expect(create.bucket).toBe(DistanceBucket.KM_1_2);
    expect(create.timeOfDay).toBe("MORNING");
  });
});

// ---------------------------------------------------------------------------
// getCommunityStatsPublic
// ---------------------------------------------------------------------------
describe("getCommunityStatsPublic", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns null when no stats exist", async () => {
    mockFindUnique.mockResolvedValue(null);
    mockFareReportFindMany.mockResolvedValue([]);

    const result = await getCommunityStatsPublic("DHAKA", "RICKSHAW", DistanceBucket.KM_1_2, "MORNING");
    expect(result).toBeNull();
  });

  it("returns null when count < 5 (low confidence)", async () => {
    mockFindUnique.mockResolvedValue({
      count: 4,
      medianFare: 100,
      iqrLow: 80,
      iqrHigh: 120,
      updatedAt: new Date(),
    });

    const result = await getCommunityStatsPublic("DHAKA", "RICKSHAW", DistanceBucket.KM_1_2, "MORNING");
    expect(result).toBeNull();
  });

  it("returns stats when count is exactly 5", async () => {
    mockFindUnique.mockResolvedValue({
      count: 5,
      medianFare: 100,
      iqrLow: 80,
      iqrHigh: 120,
      updatedAt: new Date(),
    });

    const result = await getCommunityStatsPublic("DHAKA", "RICKSHAW", DistanceBucket.KM_1_2, "MORNING");
    expect(result).not.toBeNull();
    expect(result!.count).toBe(5);
    expect(result!.medianFare).toBe(100);
  });

  it("strips internal fields (id, city, vehicleType, bucket) from response", async () => {
    mockFindUnique.mockResolvedValue({
      id: "internal-id",
      city: "DHAKA",
      vehicleType: "RICKSHAW",
      bucket: DistanceBucket.KM_1_2,
      timeOfDay: "MORNING",
      count: 10,
      medianFare: 100,
      iqrLow: 80,
      iqrHigh: 120,
      updatedAt: new Date(),
    });

    const result = await getCommunityStatsPublic("DHAKA", "RICKSHAW", DistanceBucket.KM_1_2, "MORNING");
    expect(result).not.toHaveProperty("id");
    expect(result).not.toHaveProperty("city");
    expect(result).not.toHaveProperty("vehicleType");
    expect(result).not.toHaveProperty("bucket");
    expect(result).toHaveProperty("medianFare");
    expect(result).toHaveProperty("iqrLow");
    expect(result).toHaveProperty("iqrHigh");
    expect(result).toHaveProperty("count");
    expect(result).toHaveProperty("updatedAt");
  });
});
