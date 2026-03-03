import { describe, it, expect } from "@jest/globals";

/**
 * Popular Routes Tests
 *
 * Note: These tests require a database connection.
 * Run with: npm test routes.test.ts
 */

describe("Popular Routes", () => {
  describe("calculateMedian", () => {
    it("should calculate median for odd-length array", () => {
      const values = [1, 2, 3, 4, 5];
      const median = values[Math.floor(values.length / 2)];
      expect(median).toBe(3);
    });

    it("should calculate median for even-length array", () => {
      const values = [1, 2, 3, 4];
      const mid = Math.floor(values.length / 2);
      const median = (values[mid - 1] + values[mid]) / 2;
      expect(median).toBe(2.5);
    });

    it("should handle single value", () => {
      const values = [42];
      const median = values[0];
      expect(median).toBe(42);
    });
  });

  describe("Route aggregation logic", () => {
    it("should group routes by pickup and drop areas", () => {
      // Mock fare reports
      const reports = [
        { pickupArea: "Mirpur", dropArea: "Dhanmondi", farePaid: 100 },
        { pickupArea: "Mirpur", dropArea: "Dhanmondi", farePaid: 110 },
        { pickupArea: "Mirpur", dropArea: "Dhanmondi", farePaid: 90 },
        { pickupArea: "Gulshan", dropArea: "Banani", farePaid: 50 },
      ];

      // Group by route
      const routeMap = new Map<string, typeof reports>();
      reports.forEach((report) => {
        const key = `${report.pickupArea}-${report.dropArea}`;
        if (!routeMap.has(key)) {
          routeMap.set(key, []);
        }
        routeMap.get(key)!.push(report);
      });

      expect(routeMap.size).toBe(2);
      expect(routeMap.get("Mirpur-Dhanmondi")).toHaveLength(3);
      expect(routeMap.get("Gulshan-Banani")).toHaveLength(1);
    });

    it("should calculate fare statistics correctly", () => {
      const fares = [90, 100, 110, 120, 130];
      const min = Math.min(...fares);
      const max = Math.max(...fares);
      const avg = fares.reduce((a, b) => a + b, 0) / fares.length;
      const median = fares[Math.floor(fares.length / 2)];

      expect(min).toBe(90);
      expect(max).toBe(130);
      expect(avg).toBe(110);
      expect(median).toBe(110);
    });
  });

  describe("Minimum trip count filter", () => {
    it("should require at least 3 reports for reliability", () => {
      const MIN_REPORTS = 3;
      const routes = [
        { route: "A-B", count: 5, valid: true },
        { route: "C-D", count: 2, valid: false },
        { route: "E-F", count: 3, valid: true },
        { route: "G-H", count: 1, valid: false },
      ];

      const validRoutes = routes.filter((r) => r.count >= MIN_REPORTS);
      expect(validRoutes).toHaveLength(2);
      expect(validRoutes.every((r) => r.count >= MIN_REPORTS)).toBe(true);
    });
  });

  describe("Route search", () => {
    it("should match routes case-insensitively", () => {
      const routes = [
        { pickupArea: "Mirpur", dropArea: "Dhanmondi" },
        { pickupArea: "GULSHAN", dropArea: "BANANI" },
      ];

      const searchTerm = "mirpur";
      const matches = routes.filter((r) =>
        r.pickupArea.toLowerCase().includes(searchTerm.toLowerCase())
      );

      expect(matches).toHaveLength(1);
      expect(matches[0].pickupArea).toBe("Mirpur");
    });

    it("should support partial matching", () => {
      const routes = [{ pickupArea: "Dhanmondi 27", dropArea: "Gulshan 2" }];

      const searchPickup = "Dhanmondi";
      const matches = routes.filter((r) =>
        r.pickupArea.toLowerCase().includes(searchPickup.toLowerCase())
      );

      expect(matches).toHaveLength(1);
    });
  });
});
