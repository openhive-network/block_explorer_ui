// Unit tests for the client-side aggregation behind the blocks-page range
// insights bar. @hiveio/wax is mocked virtually so importing the Hive types
// never pulls the WASM bundle.
jest.mock("@hiveio/wax", () => ({}), { virtual: true });

import {
  computeRangeStats,
  aggregateEndpointStats,
  isWideRange,
  filterSpanSeconds,
  rangeEndpointBounds,
  hasRangeEndpointBounds,
  WIDE_RANGE_MIN_SECONDS,
  type BlockStatsRow,
} from "@/utils/blockRangeStats";
import { emptyBuckets } from "@/utils/operationBuckets";

const row = (over: Partial<BlockStatsRow> = {}): BlockStatsRow => ({
  block_num: 1,
  created_at: "2026-08-28T00:00:00.000Z",
  producer_account: "alice",
  trx_count: 1,
  operationCount: 1,
  virtualOperationCount: 0,
  buckets: { ...emptyBuckets(), vote: 1 },
  ...over,
});

describe("computeRangeStats", () => {
  it("returns a zeroed shape for an empty range", () => {
    const s = computeRangeStats([]);
    expect(s.blockCount).toBe(0);
    expect(s.totalTransactions).toBe(0);
    expect(s.totalOperations).toBe(0);
    expect(s.virtualOperations).toBe(0);
    expect(s.uniqueProducers).toBe(0);
    expect(s.avgOpsPerBlock).toBe(0);
    expect(s.emptyBlocks).toBe(0);
    expect(s.busiestBlock).toBeNull();
    expect(s.fromBlock).toBeNull();
    expect(s.toBlock).toBeNull();
    expect(s.spanSeconds).toBeNull();
    expect(s.buckets).toEqual(emptyBuckets());
  });

  it("picks the busiest block by operation count", () => {
    const s = computeRangeStats([
      row({ block_num: 5, operationCount: 4 }),
      row({ block_num: 6, operationCount: 19 }),
      row({ block_num: 7, operationCount: 2 }),
    ]);
    expect(s.busiestBlock).toEqual({ blockNum: 6, operationCount: 19 });
  });
});

describe("isWideRange", () => {
  it("accepts a span of a day or more", () => {
    expect(isWideRange(WIDE_RANGE_MIN_SECONDS)).toBe(true);
    expect(isWideRange(WIDE_RANGE_MIN_SECONDS * 14)).toBe(true);
  });
});

describe("aggregateEndpointStats", () => {
  const opRow = (
    date: string,
    total_operations: number,
    operations: { op_type_id: number; op_count: number }[],
    total_transactions = 0
  ) => ({
    date: new Date(date),
    total_transactions,
    total_operations,
    operations,
    last_block_num: 1,
  });

  it("prefers the transaction endpoint's count over the op endpoint's", () => {
    const s = aggregateEndpointStats(
      [
        {
          date: new Date("2026-08-01"),
          trx_count: 10,
          avg_trx: 1,
          min_trx: 0,
          max_trx: 5,
          last_block_num: 1,
        },
      ],
      [opRow("2026-08-01", 3, [{ op_type_id: 0, op_count: 3 }], 99)]
    );
    expect(s.totalTransactions).toBe(10);
  });
});

describe("filterSpanSeconds", () => {
  const NOW = Date.parse("2026-08-28T12:00:00.000Z");

  it("returns null when no range filter is active", () => {
    expect(filterSpanSeconds({}, NOW)).toBeNull();
  });

  it("prefers the date range over the block range when both are set", () => {
    const span = filterSpanSeconds(
      {
        startDate: new Date("2026-08-01T00:00:00.000Z"),
        endDate: new Date("2026-08-03T00:00:00.000Z"),
        fromBlock: 1,
        toBlock: 999999,
      },
      NOW
    );
    expect(span).toBe(2 * 86400);
  });
});

describe("rangeEndpointBounds / hasRangeEndpointBounds", () => {
  it("prefers block numbers over dates", () => {
    const bounds = rangeEndpointBounds({
      fromBlock: 10,
      toBlock: 20,
      startDate: new Date("2026-08-01"),
      endDate: new Date("2026-08-02"),
    });
    expect(bounds.fromBlock).toBe(10);
    expect(bounds.toBlock).toBe(20);
  });

  it("does not accept an upper bound alone - that is the whole chain", () => {
    expect(hasRangeEndpointBounds({ toBlock: 500 })).toBe(false);
  });
});
