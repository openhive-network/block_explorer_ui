import Hive from "@/types/Hive";
import {
  ACTIVE_WITNESS_COUNT,
  rangeToWindow,
  summariseMissedBlocks,
  toMissedBlocksRows,
  toMissedBlocksTrend,
  completedTrend,
  currentPeriodStart,
  summariseTrend,
  formatMissRate,
} from "@/utils/witnessMissedBlocks";

const row = (
  over: Partial<Hive.WitnessMissedBlocksResponse>
): Hive.WitnessMissedBlocksResponse =>
  ({
    period: null,
    producer: "alice",
    missed_count: 1,
    produced_count: 0,
    rate: 0,
    first_missed_block: 1,
    last_missed_block: 2,
    first_missed_at: "2026-09-24T00:00:00",
    last_missed_at: "2026-09-24T01:00:00",
    ...over,
  }) as Hive.WitnessMissedBlocksResponse;

const witness = (name: string, rank: number): Hive.Witness =>
  ({ witness_name: name, rank }) as Hive.Witness;

describe("toMissedBlocksRows", () => {
  it("flags the active set from the witness list", () => {
    const rows = toMissedBlocksRows(
      [row({ producer: "alice" }), row({ producer: "bob" })],
      [witness("alice", 3), witness("bob", 45)]
    );

    expect(rows[0]).toMatchObject({ producer: "alice", isActive: true });
    expect(rows[1]).toMatchObject({ producer: "bob", isActive: false });
  });

  it("treats a witness absent from the list as not active", () => {
    const [only] = toMissedBlocksRows(
      [row({ producer: "ghost" })],
      [witness("alice", 1)]
    );

    expect(only.isActive).toBe(false);
  });

  it("treats the last active rank as active and the next as backup", () => {
    const rows = toMissedBlocksRows(
      [row({ producer: "edge" }), row({ producer: "over" })],
      [
        witness("edge", ACTIVE_WITNESS_COUNT),
        witness("over", ACTIVE_WITNESS_COUNT + 1),
      ]
    );

    expect(rows[0].isActive).toBe(true);
    expect(rows[1].isActive).toBe(false);
  });

  it("drops witnesses that missed nothing", () => {
    const rows = toMissedBlocksRows(
      [row({ producer: "alice" }), row({ producer: "bob", missed_count: 0 })],
      []
    );

    expect(rows.map((r) => r.producer)).toEqual(["alice"]);
  });

  it("drops the chain-wide rows that carry no producer", () => {
    expect(toMissedBlocksRows([row({ producer: null })], [])).toHaveLength(0);
  });

  it("returns an empty list when the API sent nothing", () => {
    expect(toMissedBlocksRows(undefined, undefined)).toEqual([]);
  });
});

describe("summariseMissedBlocks", () => {
  it("rates misses against scheduled slots, not produced blocks", () => {
    const totals = summariseMissedBlocks(
      toMissedBlocksRows(
        [
          row({ producer: "alice", missed_count: 1, produced_count: 9 }),
          row({ producer: "bob", missed_count: 3, produced_count: 7 }),
        ],
        [witness("alice", 2), witness("bob", 40)]
      )
    );

    expect(totals.missed).toBe(4);
    expect(totals.produced).toBe(16);
    expect(totals.rate).toBeCloseTo(0.2);
    expect(totals.witnessCount).toBe(2);
    expect(totals.activeWitnessCount).toBe(1);
  });

  it("does not divide by zero when nothing was scheduled", () => {
    expect(summariseMissedBlocks([]).rate).toBe(0);
  });
});

describe("toMissedBlocksTrend", () => {
  it("keeps only bucketed rows and orders them oldest first", () => {
    const trend = toMissedBlocksTrend([
      row({ period: "2026-09-23", producer: null, missed_count: 93 }),
      row({ period: "2026-09-21", producer: null, missed_count: 95 }),
      row({ period: null, producer: "alice", missed_count: 5 }),
    ]);

    expect(trend.map((p) => p.period)).toEqual(["2026-09-21", "2026-09-23"]);
    expect(trend[0].missed).toBe(95);
  });
});

describe("summariseTrend", () => {
  it("totals the chain-wide series rather than the capped leaderboard", () => {
    const trend = toMissedBlocksTrend([
      row({
        period: "2026-09-21",
        producer: null,
        missed_count: 95,
        produced_count: 28705,
      }),
      row({
        period: "2026-09-22",
        producer: null,
        missed_count: 94,
        produced_count: 28706,
      }),
    ]);

    const totals = summariseTrend(trend);
    expect(totals.missed).toBe(189);
    expect(totals.produced).toBe(57411);
    expect(totals.buckets).toBe(2);
    expect(totals.rate).toBeCloseTo(189 / 57600, 6);
  });

  it("does not divide by zero on an empty series", () => {
    expect(summariseTrend([]).rate).toBe(0);
  });
});

describe("rangeToWindow", () => {
  const now = new Date("2026-09-24T13:45:00Z");

  it("starts today at UTC midnight and runs to now", () => {
    const { fromDate, toDate } = rangeToWindow("today", now);

    expect(fromDate.toISOString()).toBe("2026-09-24T00:00:00.000Z");
    expect(toDate.getTime()).toBe(now.getTime());
  });

  it("spans whole UTC days back for the longer ranges", () => {
    expect(rangeToWindow("7d", now).fromDate.toISOString()).toBe(
      "2026-09-17T00:00:00.000Z"
    );
    expect(rangeToWindow("30d", now).fromDate.toISOString()).toBe(
      "2026-08-25T00:00:00.000Z"
    );
  });
});

describe("completedTrend", () => {
  const point = (period: string) => ({
    period,
    missed: 1,
    produced: 1,
    rate: 0.5,
  });

  it("drops the in-progress period", () => {
    const from = currentPeriodStart("day", new Date("2026-09-24T13:45:00Z"));
    const done = completedTrend(
      [point("2026-09-23"), point("2026-09-24")],
      from
    );

    expect(done.map((p) => p.period)).toEqual(["2026-09-23"]);
  });

  it("keeps the in-progress period when it is the only one", () => {
    expect(completedTrend([point("2026-09-24")], "2026-09-24")).toHaveLength(1);
  });

  it("starts the current week on Monday", () => {
    expect(currentPeriodStart("week", new Date("2026-09-24T13:45:00Z"))).toBe(
      "2026-09-21"
    );
  });
});

describe("formatMissRate", () => {
  it("keeps a small rate legible instead of rounding it to zero", () => {
    expect(formatMissRate(0.003299, "en")).toBe("0.33%");
  });

  it("formats a whole rate without false precision", () => {
    expect(formatMissRate(1, "en")).toBe("100%");
  });
});
