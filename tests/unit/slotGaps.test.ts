// Unit tests for slot-gap detection on the blocks list. @hiveio/wax is mocked
// virtually so importing the Hive types never pulls the WASM bundle.
jest.mock("@hiveio/wax", () => ({}), { virtual: true });

import {
  computeSlotDeltas,
  isContiguousRange,
  HIVE_SLOT_SECONDS,
  type SlotGapRow,
} from "@/utils/slotGaps";

// The table renders newest-first, which is the order these helpers receive.
const desc = (...pairs: [number, string][]): SlotGapRow[] =>
  pairs.map(([block_num, created_at]) => ({ block_num, created_at }));

const at = (seconds: number) =>
  new Date(
    Date.parse("2026-08-28T00:00:00.000Z") + seconds * 1000
  ).toISOString();

describe("computeSlotDeltas", () => {
  it("returns an empty list for no rows", () => {
    expect(computeSlotDeltas([])).toEqual([]);
  });

  it("leaves the oldest row's delta unknown - it has no predecessor on the page", () => {
    const [newer, oldest] = computeSlotDeltas(desc([11, at(3)], [10, at(0)]));
    expect(newer.deltaSeconds).toBe(3);
    expect(oldest.deltaSeconds).toBeNull();
    expect(oldest.missedSlots).toBe(0);
  });

  it("reports no misses when blocks are one slot apart", () => {
    const deltas = computeSlotDeltas(
      desc([12, at(6)], [11, at(3)], [10, at(0)])
    );
    expect(deltas.map((d) => d.missedSlots)).toEqual([0, 0, 0]);
    expect(deltas[0].deltaSeconds).toBe(HIVE_SLOT_SECONDS);
  });

  it("counts one missed slot for a six second gap", () => {
    const deltas = computeSlotDeltas(desc([11, at(6)], [10, at(0)]));
    expect(deltas[0].deltaSeconds).toBe(6);
    expect(deltas[0].missedSlots).toBe(1);
  });

  // A filtered result set (by op type or account) is sparse, so a time gap
  // between adjacent ROWS says nothing about missed slots.
  it("refuses to infer a gap when the rows are not consecutive blocks", () => {
    const deltas = computeSlotDeltas(desc([20, at(90)], [10, at(0)]));
    expect(deltas[0].deltaSeconds).toBeNull();
    expect(deltas[0].missedSlots).toBe(0);
  });
});

describe("isContiguousRange", () => {
  it("is true when every row but the oldest has a known delta", () => {
    const deltas = computeSlotDeltas(
      desc([12, at(6)], [11, at(3)], [10, at(0)])
    );
    expect(isContiguousRange(deltas)).toBe(true);
  });

  it("is false when the page is a filtered, sparse set", () => {
    const deltas = computeSlotDeltas(
      desc([40, at(120)], [25, at(60)], [10, at(0)])
    );
    expect(isContiguousRange(deltas)).toBe(false);
  });
});
