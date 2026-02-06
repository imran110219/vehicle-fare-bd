import { calculateFare, roundTo } from "@/lib/fare";
import { fareConfig } from "@/lib/config";

const baseConfig = {
  id: "test-1",
  city: "KHULNA" as const,
  vehicleType: "RICKSHAW" as const,
  baseFare: 30,
  perKmRate: 20,
  morningMultiplier: 1,
  afternoonMultiplier: 1.05,
  eveningMultiplier: 1.1,
  nightMultiplier: 1.2,
  createdAt: new Date(),
  updatedAt: new Date()
};

describe("calculateFare - extended tests", () => {
  describe("time of day multipliers", () => {
    it("applies morning multiplier correctly", () => {
      const result = calculateFare({
        config: baseConfig,
        distanceKm: 5,
        timeOfDay: "MORNING",
        luggage: false,
        traffic: false
      });
      expect(result.multiplier).toBe(1);
    });

    it("applies afternoon multiplier correctly", () => {
      const result = calculateFare({
        config: baseConfig,
        distanceKm: 5,
        timeOfDay: "AFTERNOON",
        luggage: false,
        traffic: false
      });
      expect(result.multiplier).toBe(1.05);
    });

    it("applies evening multiplier correctly", () => {
      const result = calculateFare({
        config: baseConfig,
        distanceKm: 5,
        timeOfDay: "EVENING",
        luggage: false,
        traffic: false
      });
      expect(result.multiplier).toBe(1.1);
    });

    it("applies night multiplier correctly", () => {
      const result = calculateFare({
        config: baseConfig,
        distanceKm: 5,
        timeOfDay: "NIGHT",
        luggage: false,
        traffic: false
      });
      expect(result.multiplier).toBe(1.2);
    });
  });

  describe("condition multipliers", () => {
    it("adds rain multiplier when weather is RAIN", () => {
      const result = calculateFare({
        config: baseConfig,
        distanceKm: 5,
        timeOfDay: "MORNING",
        weather: "RAIN",
        luggage: false,
        traffic: false
      });
      expect(result.multiplier).toBe(1 + fareConfig.rainMultiplier);
    });

    it("does not add rain multiplier when weather is CLEAR", () => {
      const result = calculateFare({
        config: baseConfig,
        distanceKm: 5,
        timeOfDay: "MORNING",
        weather: "CLEAR",
        luggage: false,
        traffic: false
      });
      expect(result.multiplier).toBe(1);
    });

    it("adds traffic multiplier when traffic is true", () => {
      const result = calculateFare({
        config: baseConfig,
        distanceKm: 5,
        timeOfDay: "MORNING",
        luggage: false,
        traffic: true
      });
      expect(result.multiplier).toBe(1 + fareConfig.trafficMultiplier);
    });

    it("adds luggage multiplier when luggage is true", () => {
      const result = calculateFare({
        config: baseConfig,
        distanceKm: 5,
        timeOfDay: "MORNING",
        luggage: true,
        traffic: false
      });
      expect(result.multiplier).toBe(1 + fareConfig.luggageMultiplier);
    });

    it("combines all multipliers correctly", () => {
      const result = calculateFare({
        config: baseConfig,
        distanceKm: 5,
        timeOfDay: "NIGHT",
        weather: "RAIN",
        luggage: true,
        traffic: true
      });
      const expectedMultiplier =
        baseConfig.nightMultiplier +
        fareConfig.rainMultiplier +
        fareConfig.trafficMultiplier +
        fareConfig.luggageMultiplier;
      expect(result.multiplier).toBeCloseTo(expectedMultiplier, 2);
    });
  });

  describe("demand pressure", () => {
    it("adds demand pressure for supported cities", () => {
      const result = calculateFare({
        config: { ...baseConfig, city: "DHAKA" },
        distanceKm: 5,
        timeOfDay: "EVENING",
        luggage: false,
        traffic: false
      });
      expect(result.multiplier).toBeCloseTo(1.1 + 0.1, 2);
    });

    it("does not add demand pressure for other cities", () => {
      const result = calculateFare({
        config: baseConfig,
        distanceKm: 5,
        timeOfDay: "EVENING",
        luggage: false,
        traffic: false
      });
      expect(result.multiplier).toBe(1.1);
    });
  });

  describe("fare calculation", () => {
    it("calculates base fare correctly", () => {
      const result = calculateFare({
        config: baseConfig,
        distanceKm: 0,
        timeOfDay: "MORNING",
        luggage: false,
        traffic: false
      });
      expect(result.baseFare).toBe(30);
    });

    it("calculates distance fare correctly", () => {
      const result = calculateFare({
        config: baseConfig,
        distanceKm: 5,
        timeOfDay: "MORNING",
        luggage: false,
        traffic: false
      });
      expect(result.distanceFare).toBe(100); // 20 * 5 = 100
    });

    it("calculates total fare correctly", () => {
      const result = calculateFare({
        config: baseConfig,
        distanceKm: 5,
        timeOfDay: "MORNING",
        luggage: false,
        traffic: false
      });
      // (30 + 100) * 1 = 130
      expect(result.totalFare).toBe(130);
    });

    it("applies multiplier to total", () => {
      const result = calculateFare({
        config: baseConfig,
        distanceKm: 5,
        timeOfDay: "NIGHT",
        luggage: false,
        traffic: false
      });
      // (30 + 100) * 1.2 = 156
      expect(result.totalFare).toBe(156);
    });
  });

  describe("typical range", () => {
    it("calculates typical low correctly", () => {
      const result = calculateFare({
        config: baseConfig,
        distanceKm: 5,
        timeOfDay: "MORNING",
        luggage: false,
        traffic: false
      });
      // 130 * (1 - 0.15) = 110.5 → 111 (rounded)
      const expectedLow = Math.round(130 * (1 - fareConfig.typicalRangePercent));
      expect(result.typicalLow).toBe(expectedLow);
    });

    it("calculates typical high correctly", () => {
      const result = calculateFare({
        config: baseConfig,
        distanceKm: 5,
        timeOfDay: "MORNING",
        luggage: false,
        traffic: false
      });
      // 130 * (1 + 0.15) = 149.5 → 150 (rounded)
      const expectedHigh = Math.round(130 * (1 + fareConfig.typicalRangePercent));
      expect(result.typicalHigh).toBe(expectedHigh);
    });
  });

  describe("edge cases", () => {
    it("handles zero distance", () => {
      const result = calculateFare({
        config: baseConfig,
        distanceKm: 0,
        timeOfDay: "MORNING",
        luggage: false,
        traffic: false
      });
      expect(result.totalFare).toBe(30); // base fare only
    });

    it("handles very small distance", () => {
      const result = calculateFare({
        config: baseConfig,
        distanceKm: 0.1,
        timeOfDay: "MORNING",
        luggage: false,
        traffic: false
      });
      expect(result.distanceFare).toBe(2); // 20 * 0.1 = 2
    });

    it("handles large distance", () => {
      const result = calculateFare({
        config: baseConfig,
        distanceKm: 50,
        timeOfDay: "MORNING",
        luggage: false,
        traffic: false
      });
      expect(result.distanceFare).toBe(1000); // 20 * 50 = 1000
    });

    it("includes notes in result", () => {
      const result = calculateFare({
        config: baseConfig,
        distanceKm: 5,
        timeOfDay: "MORNING",
        luggage: false,
        traffic: false
      });
      expect(result.notes).toHaveLength(1);
      expect(result.notes[0]).toContain("Typical range");
    });
  });
});

describe("roundTo", () => {
  it("rounds to 0 decimal places", () => {
    expect(roundTo(10.4, 0)).toBe(10);
    expect(roundTo(10.5, 0)).toBe(11);
    expect(roundTo(10.6, 0)).toBe(11);
  });

  it("rounds to 1 decimal place", () => {
    expect(roundTo(10.44, 1)).toBe(10.4);
    expect(roundTo(10.45, 1)).toBe(10.5);
    expect(roundTo(10.46, 1)).toBe(10.5);
  });

  it("rounds to 2 decimal places", () => {
    expect(roundTo(10.444, 2)).toBe(10.44);
    expect(roundTo(10.445, 2)).toBe(10.45);
    expect(roundTo(10.446, 2)).toBe(10.45);
  });

  it("handles negative numbers", () => {
    expect(roundTo(-10.5, 0)).toBe(-10);
    expect(roundTo(-10.6, 0)).toBe(-11);
  });

  it("handles zero", () => {
    expect(roundTo(0, 0)).toBe(0);
    expect(roundTo(0, 2)).toBe(0);
  });
});
