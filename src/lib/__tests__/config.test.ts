import { fareConfig } from "@/lib/config";

describe("fareConfig", () => {
  it("has default rain multiplier", () => {
    expect(fareConfig.rainMultiplier).toBe(0.2);
  });

  it("has default traffic multiplier", () => {
    expect(fareConfig.trafficMultiplier).toBe(0.1);
  });

  it("has default luggage multiplier", () => {
    expect(fareConfig.luggageMultiplier).toBe(0.1);
  });

  it("has default typical range percent", () => {
    expect(fareConfig.typicalRangePercent).toBe(0.15);
  });

  it("has default stats cache duration", () => {
    expect(fareConfig.statsCacheDurationMinutes).toBe(10);
  });

  it("has default max reports per day", () => {
    expect(fareConfig.maxReportsPerDay).toBe(10);
  });

  it("has default duplicate window minutes", () => {
    expect(fareConfig.duplicateWindowMinutes).toBe(10);
  });

  it("all values are numbers", () => {
    expect(typeof fareConfig.rainMultiplier).toBe("number");
    expect(typeof fareConfig.trafficMultiplier).toBe("number");
    expect(typeof fareConfig.luggageMultiplier).toBe("number");
    expect(typeof fareConfig.typicalRangePercent).toBe("number");
    expect(typeof fareConfig.statsCacheDurationMinutes).toBe("number");
    expect(typeof fareConfig.maxReportsPerDay).toBe("number");
    expect(typeof fareConfig.duplicateWindowMinutes).toBe("number");
  });

  it("multipliers are positive", () => {
    expect(fareConfig.rainMultiplier).toBeGreaterThan(0);
    expect(fareConfig.trafficMultiplier).toBeGreaterThan(0);
    expect(fareConfig.luggageMultiplier).toBeGreaterThan(0);
  });

  it("typical range is between 0 and 1", () => {
    expect(fareConfig.typicalRangePercent).toBeGreaterThan(0);
    expect(fareConfig.typicalRangePercent).toBeLessThan(1);
  });
});
