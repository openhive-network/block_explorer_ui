import {
  OP_BUCKET_ORDER,
  bucketOperations,
  emptyBuckets,
  type OpBucket,
} from "@/utils/operationBuckets";

// The statistics endpoints bucket by day at their finest; a shorter span would
// report the whole day's totals instead of the range, so it stays client-side.
export const WIDE_RANGE_MIN_SECONDS = 86400;

export interface BlockStatsRow {
  block_num: number;
  created_at: Date | string;
  producer_account: string;
  trx_count: number;
  operationCount: number;
  virtualOperationCount: number;
  buckets: Record<OpBucket, number>;
}

export interface RangeStats {
  blockCount: number;
  totalTransactions: number;
  totalOperations: number;
  virtualOperations: number;
  uniqueProducers: number;
  avgOpsPerBlock: number;
  busiestBlock: { blockNum: number; operationCount: number } | null;
  emptyBlocks: number;
  buckets: Record<OpBucket, number>;
  fromBlock: number | null;
  toBlock: number | null;
  spanSeconds: number | null;
}

const timestampOf = (value: Date | string): number => {
  const ms = value instanceof Date ? value.getTime() : Date.parse(value);
  return Number.isNaN(ms) ? NaN : ms;
};

export const computeRangeStats = (rows: BlockStatsRow[]): RangeStats => {
  const stats: RangeStats = {
    blockCount: rows.length,
    totalTransactions: 0,
    totalOperations: 0,
    virtualOperations: 0,
    uniqueProducers: 0,
    avgOpsPerBlock: 0,
    busiestBlock: null,
    emptyBlocks: 0,
    buckets: emptyBuckets(),
    fromBlock: null,
    toBlock: null,
    spanSeconds: null,
  };
  if (!rows.length) return stats;

  const producers = new Set<string>();
  let oldest = Infinity;
  let newest = -Infinity;

  for (const row of rows) {
    stats.totalTransactions += row.trx_count ?? 0;
    stats.totalOperations += row.operationCount ?? 0;
    stats.virtualOperations += row.virtualOperationCount ?? 0;
    if (!row.trx_count) stats.emptyBlocks += 1;
    if (row.producer_account) producers.add(row.producer_account);

    for (const bucket of OP_BUCKET_ORDER) {
      stats.buckets[bucket] += row.buckets?.[bucket] ?? 0;
    }

    stats.fromBlock =
      stats.fromBlock === null
        ? row.block_num
        : Math.min(stats.fromBlock, row.block_num);
    stats.toBlock =
      stats.toBlock === null
        ? row.block_num
        : Math.max(stats.toBlock, row.block_num);

    // Ties resolve to the lower block number so the figure is stable across refetches.
    const busiest = stats.busiestBlock;
    if (
      !busiest ||
      row.operationCount > busiest.operationCount ||
      (row.operationCount === busiest.operationCount &&
        row.block_num < busiest.blockNum)
    ) {
      stats.busiestBlock = {
        blockNum: row.block_num,
        operationCount: row.operationCount,
      };
    }

    const ms = timestampOf(row.created_at);
    if (!Number.isNaN(ms)) {
      oldest = Math.min(oldest, ms);
      newest = Math.max(newest, ms);
    }
  }

  stats.uniqueProducers = producers.size;
  stats.avgOpsPerBlock =
    Math.round((stats.totalOperations / rows.length) * 10) / 10;
  if (Number.isFinite(oldest) && Number.isFinite(newest)) {
    stats.spanSeconds = Math.round((newest - oldest) / 1000);
  }

  return stats;
};

export const isWideRange = (spanSeconds: number | null | undefined): boolean =>
  typeof spanSeconds === "number" && spanSeconds >= WIDE_RANGE_MIN_SECONDS;

// Only the fields read here are required; the rest of each endpoint row is
// declared optional so a full response can be passed straight through.
interface TransactionStatsRow {
  trx_count: number;
  date?: Date | string;
  avg_trx?: number;
  min_trx?: number;
  max_trx?: number;
  last_block_num?: number;
}

interface OperationTypeStatsRow {
  total_transactions: number;
  operations: { op_type_id: number; op_count: number }[];
  date?: Date | string;
  total_operations?: number;
  last_block_num?: number;
}

export interface EndpointRangeStats {
  totalTransactions: number;
  totalOperations: number;
  virtualOperations: number;
  buckets: Record<OpBucket, number>;
}

// Both endpoints return one row per day bucket, never a single range total, so
// the sum happens here. Per-block figures (average, busiest, producers, empty
// blocks) are not derivable from them and stay client-side.
export const aggregateEndpointStats = (
  transactionRows: TransactionStatsRow[] | undefined,
  operationRows: OperationTypeStatsRow[] | undefined,
  isVirtual?: (opTypeId: number) => boolean | undefined
): EndpointRangeStats => {
  const buckets = emptyBuckets();
  let operationTransactions = 0;

  for (const row of operationRows ?? []) {
    operationTransactions += row.total_transactions ?? 0;
    const rowBuckets = bucketOperations(row.operations, isVirtual);
    for (const bucket of OP_BUCKET_ORDER) {
      buckets[bucket] += rowBuckets[bucket];
    }
  }

  const virtualOperations = buckets.virtual;
  const totalOperations =
    OP_BUCKET_ORDER.reduce((sum, bucket) => sum + buckets[bucket], 0) -
    virtualOperations;

  const totalTransactions = transactionRows?.length
    ? transactionRows.reduce((sum, row) => sum + (row.trx_count ?? 0), 0)
    : operationTransactions;

  return {
    totalTransactions,
    totalOperations,
    virtualOperations,
    buckets,
  };
};

const UNIT_SECONDS: Record<string, number> = {
  hours: 3600,
  days: 86400,
  weeks: 604800,
  months: 2592000,
};

const HIVE_SLOT_SECONDS = 3;

export interface RangeFilterParams {
  startDate?: Date | string;
  endDate?: Date | string;
  lastTime?: number;
  timeUnit?: string;
  lastBlocks?: number;
  fromBlock?: number;
  toBlock?: number;
}

// How much wall-clock the active filter covers, which is what decides whether
// the day-bucketed endpoints can describe it. Not the same as the loaded page's
// span: one page is 100 blocks of a filter that may cover weeks.
export const filterSpanSeconds = (
  params: RangeFilterParams,
  now: number = Date.now()
): number | null => {
  const start = params.startDate ? new Date(params.startDate).getTime() : NaN;
  if (!Number.isNaN(start)) {
    const end = params.endDate ? new Date(params.endDate).getTime() : now;
    if (!Number.isNaN(end) && end > start) {
      return Math.round((end - start) / 1000);
    }
  }

  if (params.lastTime && params.timeUnit && UNIT_SECONDS[params.timeUnit]) {
    return params.lastTime * UNIT_SECONDS[params.timeUnit];
  }

  // "Last N blocks" sets no toBlock, so the branch below cannot measure it.
  if (params.lastBlocks) {
    return params.lastBlocks * HIVE_SLOT_SECONDS;
  }

  if (
    typeof params.fromBlock === "number" &&
    typeof params.toBlock === "number" &&
    params.toBlock > params.fromBlock
  ) {
    return (params.toBlock - params.fromBlock) * HIVE_SLOT_SECONDS;
  }

  return null;
};

const asBound = (
  value: number | Date | string | undefined
): number | Date | undefined => {
  if (typeof value === "number") return value;
  if (value instanceof Date)
    return Number.isNaN(value.getTime()) ? undefined : value;
  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }
  return undefined;
};

export const rangeEndpointBounds = (
  params: RangeFilterParams
): {
  fromBlock: number | Date | undefined;
  toBlock: number | Date | undefined;
} => ({
  fromBlock: asBound(params.fromBlock ?? params.startDate),
  toBlock: asBound(params.toBlock ?? params.endDate),
});

// Without a from-block the endpoints answer for the whole chain.
export const hasRangeEndpointBounds = (params: RangeFilterParams): boolean =>
  rangeEndpointBounds(params).fromBlock !== undefined;
