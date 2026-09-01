// Unit tests for the KPI baseline maths on the blocks page.
jest.mock("@hiveio/wax", () => ({}), { virtual: true });

import {
  baselineDeltaPct,
  computePerBlockBaseline,
  median,
} from "@/utils/blockBaseline";

const day = (last_block_num: number, value: number) => ({
  last_block_num,
  value,
});

describe("median", () => {
  it("takes the middle value of an odd-length set", () => {
    expect(median([5, 1, 3])).toBe(3);
  });
});

describe("computePerBlockBaseline", () => {
  it("divides each day's operations by the blocks actually produced", () => {
    // 200 blocks carrying 4000 ops, then 200 carrying 2000 -> 20 and 10.
    const result = computePerBlockBaseline([
      day(1000, 0),
      day(1200, 4000),
      day(1400, 2000),
    ]);
    expect(result).toEqual({ median: 15, days: 2 });
  });
});

describe("baselineDeltaPct", () => {
  it("reports how far above the baseline a figure sits", () => {
    expect(baselineDeltaPct(12, 10)).toBe(20);
  });

  it("returns null rather than dividing by a missing baseline", () => {
    expect(baselineDeltaPct(10, null)).toBeNull();
    expect(baselineDeltaPct(10, undefined)).toBeNull();
    expect(baselineDeltaPct(10, 0)).toBeNull();
  });
});
