import { startOfDayBD } from "@/lib/rateLimit";

describe("startOfDayBD", () => {
  it("returns a Date object", () => {
    const result = startOfDayBD();
    expect(result).toBeInstanceOf(Date);
  });

  it("returns a date in the past or present", () => {
    const result = startOfDayBD();
    expect(result.getTime()).toBeLessThanOrEqual(Date.now());
  });

  it("returns consistent results within same instant", () => {
    const result1 = startOfDayBD();
    const result2 = startOfDayBD();
    expect(result1.getTime()).toBe(result2.getTime());
  });

  it("is at most 24 hours in the past", () => {
    const result = startOfDayBD();
    const dayInMs = 24 * 60 * 60 * 1000;
    expect(Date.now() - result.getTime()).toBeLessThanOrEqual(dayInMs);
  });

  it("is always before or equal to current time", () => {
    const result = startOfDayBD();
    expect(result.getTime()).toBeLessThanOrEqual(Date.now());
  });

  it("has zeroed minutes, seconds, and milliseconds in BD time", () => {
    const result = startOfDayBD();
    // Convert to BD timezone by adding 6 hours
    const bdTime = new Date(result.getTime() + 6 * 60 * 60 * 1000);
    expect(bdTime.getUTCMinutes()).toBe(0);
    expect(bdTime.getUTCSeconds()).toBe(0);
    expect(bdTime.getUTCMilliseconds()).toBe(0);
  });

  it("returns same value for queries close in time", () => {
    const result1 = startOfDayBD();
    // Wait a tiny bit
    const result2 = startOfDayBD();
    // Should be the same since we're within the same BD day
    expect(result1.getTime()).toBe(result2.getTime());
  });
});
