import { getDistanceBucket } from "@/lib/buckets";
import { DistanceBucket } from "@prisma/client";

describe("getDistanceBucket", () => {
  it("assigns buckets correctly", () => {
    expect(getDistanceBucket(0.5)).toBe(DistanceBucket.KM_0_1);
    expect(getDistanceBucket(1.5)).toBe(DistanceBucket.KM_1_2);
    expect(getDistanceBucket(2.5)).toBe(DistanceBucket.KM_2_3);
    expect(getDistanceBucket(4)).toBe(DistanceBucket.KM_3_5);
    expect(getDistanceBucket(6)).toBe(DistanceBucket.KM_5_8);
    expect(getDistanceBucket(9)).toBe(DistanceBucket.KM_8_PLUS);
  });
});
