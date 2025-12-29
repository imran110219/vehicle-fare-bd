import { calculateFare } from "@/lib/fare";

const config = { id: "1", city: "DHAKA", baseFare: 30, perKmRate: 20, createdAt: new Date(), updatedAt: new Date() };

describe("calculateFare", () => {
  it("applies base and distance rates", () => {
    const result = calculateFare({
      config,
      distanceKm: 2,
      timeOfDay: "MORNING",
      weather: "CLEAR",
      luggage: false,
      traffic: false
    });

    expect(result.totalFare).toBe(70);
    expect(result.typicalLow).toBe(60);
    expect(result.typicalHigh).toBe(81);
  });

  it("applies multipliers", () => {
    const result = calculateFare({
      config,
      distanceKm: 3,
      timeOfDay: "NIGHT",
      weather: "RAIN",
      luggage: true,
      traffic: true
    });

    expect(result.multiplier).toBeCloseTo(1.55, 2);
  });
});
