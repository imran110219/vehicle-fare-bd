import { getDistanceBucket, formatBucket } from "@/lib/buckets";
import { DistanceBucket } from "@prisma/client";

describe("getDistanceBucket - extended tests", () => {
  describe("boundary conditions", () => {
    it("assigns 0 km to KM_0_1", () => {
      expect(getDistanceBucket(0)).toBe(DistanceBucket.KM_0_1);
    });

    it("assigns exactly 1 km to KM_0_1", () => {
      expect(getDistanceBucket(1)).toBe(DistanceBucket.KM_0_1);
    });

    it("assigns 1.01 km to KM_1_2", () => {
      expect(getDistanceBucket(1.01)).toBe(DistanceBucket.KM_1_2);
    });

    it("assigns exactly 2 km to KM_1_2", () => {
      expect(getDistanceBucket(2)).toBe(DistanceBucket.KM_1_2);
    });

    it("assigns 2.01 km to KM_2_3", () => {
      expect(getDistanceBucket(2.01)).toBe(DistanceBucket.KM_2_3);
    });

    it("assigns exactly 3 km to KM_2_3", () => {
      expect(getDistanceBucket(3)).toBe(DistanceBucket.KM_2_3);
    });

    it("assigns 3.01 km to KM_3_5", () => {
      expect(getDistanceBucket(3.01)).toBe(DistanceBucket.KM_3_5);
    });

    it("assigns exactly 5 km to KM_3_5", () => {
      expect(getDistanceBucket(5)).toBe(DistanceBucket.KM_3_5);
    });

    it("assigns 5.01 km to KM_5_8", () => {
      expect(getDistanceBucket(5.01)).toBe(DistanceBucket.KM_5_8);
    });

    it("assigns exactly 8 km to KM_5_8", () => {
      expect(getDistanceBucket(8)).toBe(DistanceBucket.KM_5_8);
    });

    it("assigns 8.01 km to KM_8_PLUS", () => {
      expect(getDistanceBucket(8.01)).toBe(DistanceBucket.KM_8_PLUS);
    });
  });

  describe("typical distances", () => {
    it("assigns short walks to KM_0_1", () => {
      expect(getDistanceBucket(0.3)).toBe(DistanceBucket.KM_0_1);
      expect(getDistanceBucket(0.7)).toBe(DistanceBucket.KM_0_1);
    });

    it("assigns medium distances correctly", () => {
      expect(getDistanceBucket(4)).toBe(DistanceBucket.KM_3_5);
      expect(getDistanceBucket(6.5)).toBe(DistanceBucket.KM_5_8);
    });

    it("assigns long distances to KM_8_PLUS", () => {
      expect(getDistanceBucket(10)).toBe(DistanceBucket.KM_8_PLUS);
      expect(getDistanceBucket(20)).toBe(DistanceBucket.KM_8_PLUS);
      expect(getDistanceBucket(50)).toBe(DistanceBucket.KM_8_PLUS);
    });
  });

  describe("edge cases", () => {
    it("handles very small positive numbers", () => {
      expect(getDistanceBucket(0.001)).toBe(DistanceBucket.KM_0_1);
    });

    it("handles decimal precision", () => {
      expect(getDistanceBucket(1.999)).toBe(DistanceBucket.KM_1_2);
      expect(getDistanceBucket(2.001)).toBe(DistanceBucket.KM_2_3);
    });
  });
});

describe("formatBucket", () => {
  it("formats KM_0_1 correctly", () => {
    expect(formatBucket(DistanceBucket.KM_0_1)).toBe("0-1 km");
  });

  it("formats KM_1_2 correctly", () => {
    expect(formatBucket(DistanceBucket.KM_1_2)).toBe("1-2 km");
  });

  it("formats KM_2_3 correctly", () => {
    expect(formatBucket(DistanceBucket.KM_2_3)).toBe("2-3 km");
  });

  it("formats KM_3_5 correctly", () => {
    expect(formatBucket(DistanceBucket.KM_3_5)).toBe("3-5 km");
  });

  it("formats KM_5_8 correctly", () => {
    expect(formatBucket(DistanceBucket.KM_5_8)).toBe("5-8 km");
  });

  it("formats KM_8_PLUS correctly", () => {
    expect(formatBucket(DistanceBucket.KM_8_PLUS)).toBe("8+ km");
  });
});
