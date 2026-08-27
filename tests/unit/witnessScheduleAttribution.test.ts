import {
  fillAttributionGaps,
  ScheduleRow,
} from "@/utils/witnessScheduleAttribution";

const rows = (entries: Array<[string, number | null]>): ScheduleRow[] =>
  entries.map(([producerName, blockNumber]) => ({ producerName, blockNumber }));

const blocks = (result: ScheduleRow[]) => result.map((r) => r.blockNumber);

const NO_MISSES: ReadonlySet<string> = new Set<string>();

describe("fillAttributionGaps", () => {
  it("credits the slot the head-block poll skipped", () => {
    // Observed on /schedule: one blank slot, one unaccounted block.
    const result = fillAttributionGaps(
      rows([
        ["blocktrades", 109_302_485],
        ["arcange", null],
        ["threespeak", 109_302_487],
      ]),
      NO_MISSES
    );
    expect(blocks(result)).toEqual([109_302_485, 109_302_486, 109_302_487]);
  });

  it("skips a slot the chain reported as missed and numbers around it", () => {
    // Two blank slots, one block, and b is a known miss: c produced 501.
    const result = fillAttributionGaps(
      rows([
        ["a", 500],
        ["b", null],
        ["c", null],
        ["d", 502],
      ]),
      new Set(["b"])
    );
    expect(blocks(result)).toEqual([500, null, 501, 502]);
  });

  it("fills nothing when the span does not reconcile", () => {
    const result = fillAttributionGaps(
      rows([
        ["a", 500],
        ["b", null],
        ["c", null],
        ["d", 502],
      ]),
      NO_MISSES
    );
    expect(blocks(result)).toEqual([500, null, null, 502]);
  });

  it("fills nothing when the reported miss is not in the span", () => {
    const result = fillAttributionGaps(
      rows([
        ["a", 500],
        ["b", null],
        ["c", null],
        ["d", 502],
      ]),
      new Set(["z"])
    );
    expect(blocks(result)).toEqual([500, null, null, 502]);
  });

  it("fills several independent spans in one pass", () => {
    const result = fillAttributionGaps(
      rows([
        ["a", 10],
        ["b", null],
        ["c", 12],
        ["d", null],
        ["e", 14],
      ]),
      NO_MISSES
    );
    expect(blocks(result)).toEqual([10, 11, 12, 13, 14]);
  });

  it("never extrapolates outside the outermost known blocks", () => {
    // Leading slots are unknown; trailing ones have not happened yet.
    const result = fillAttributionGaps(
      rows([
        ["a", null],
        ["b", 500],
        ["c", 501],
        ["d", null],
      ]),
      NO_MISSES
    );
    expect(blocks(result)).toEqual([null, 500, 501, null]);
  });

  it("leaves a schedule with fewer than two known blocks untouched", () => {
    const one = rows([
      ["a", null],
      ["b", 500],
      ["c", null],
    ]);
    expect(fillAttributionGaps(one, NO_MISSES)).toBe(one);

    const none = rows([
      ["a", null],
      ["b", null],
    ]);
    expect(fillAttributionGaps(none, NO_MISSES)).toBe(none);
  });

  it("returns the original array when there is nothing to fill", () => {
    const adjacent = rows([
      ["a", 500],
      ["b", 501],
    ]);
    expect(fillAttributionGaps(adjacent, NO_MISSES)).toBe(adjacent);
  });

  it("ignores anchors that run backwards", () => {
    const result = fillAttributionGaps(
      rows([
        ["a", 502],
        ["b", null],
        ["c", 500],
      ]),
      NO_MISSES
    );
    expect(blocks(result)).toEqual([502, null, 500]);
  });

  it("does not mutate the rows it was given", () => {
    const original = rows([
      ["a", 10],
      ["b", null],
      ["c", 12],
    ]);
    fillAttributionGaps(original, NO_MISSES);
    expect(blocks(original)).toEqual([10, null, 12]);
  });
});
