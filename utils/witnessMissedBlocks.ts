import moment from "moment";

import Hive from "@/types/Hive";

export type MissedBlocksRange = "today" | "7d" | "30d" | "90d" | "180d" | "1y";

export const RANGE_DAYS: Record<MissedBlocksRange, number> = {
  today: 0,
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "180d": 180,
  "1y": 365,
};

export const ACTIVE_WITNESS_COUNT = 20;

export interface MissedBlocksWindow {
  fromDate: Date;
  toDate: Date;
}

export const rangeToWindow = (
  range: MissedBlocksRange,
  now: Date = new Date()
): MissedBlocksWindow => {
  // Chain days are UTC days.
  const end = moment.utc(now);
  const days = RANGE_DAYS[range] ?? 0;
  return {
    fromDate: end.clone().subtract(days, "days").startOf("day").toDate(),
    toDate: end.toDate(),
  };
};

export interface MissedBlocksRow {
  producer: string;
  missedCount: number;
  producedCount: number;
  // 0-1; the API returns 1 for witnesses that produced nothing.
  rate: number;
  // Within the requested window, not all time.
  lastMissedAt: string;
  lastMissedBlock: number;
  isActive: boolean;
}

// is_active isn't in the response, so it's joined from the witness list.
export const toMissedBlocksRows = (
  rows: Hive.WitnessMissedBlocksResponse[] | undefined,
  witnesses: Hive.Witness[] | undefined
): MissedBlocksRow[] => {
  const active = new Set(
    (witnesses ?? [])
      .filter((witness) => witness?.rank <= ACTIVE_WITNESS_COUNT)
      .map((witness) => witness.witness_name)
  );

  return (
    (rows ?? [])
      // The API also returns witnesses that missed nothing.
      .filter(
        (row): row is Hive.WitnessMissedBlocksResponse & { producer: string } =>
          Boolean(row?.producer) && (row.missed_count ?? 0) > 0
      )
      .map((row) => ({
        producer: row.producer,
        missedCount: row.missed_count ?? 0,
        producedCount: row.produced_count ?? 0,
        rate: Number(row.rate ?? 0),
        lastMissedAt: row.last_missed_at,
        lastMissedBlock: row.last_missed_block ?? 0,
        isActive: active.has(row.producer),
      }))
  );
};

export interface MissedBlocksTotals {
  missed: number;
  produced: number;
  rate: number;
  witnessCount: number;
  activeWitnessCount: number;
}

export const summariseMissedBlocks = (
  rows: MissedBlocksRow[]
): MissedBlocksTotals => {
  let missed = 0;
  let produced = 0;
  let activeWitnessCount = 0;

  for (const row of rows) {
    missed += row.missedCount;
    produced += row.producedCount;
    if (row.isActive) activeWitnessCount += 1;
  }

  const scheduled = missed + produced;
  return {
    missed,
    produced,
    rate: scheduled > 0 ? missed / scheduled : 0,
    witnessCount: rows.length,
    activeWitnessCount,
  };
};

export interface MissedBlocksTrendPoint {
  period: string;
  missed: number;
  produced: number;
  rate: number;
}

export const toMissedBlocksTrend = (
  rows: Hive.WitnessMissedBlocksResponse[] | undefined
): MissedBlocksTrendPoint[] =>
  (rows ?? [])
    .filter((row) => Boolean(row?.period))
    .map((row) => ({
      period: row.period as string,
      missed: row.missed_count ?? 0,
      produced: row.produced_count ?? 0,
      rate: Number(row.rate ?? 0),
    }))
    .sort((a, b) => a.period.localeCompare(b.period));

export type MissedBlocksGranularity = "day" | "week" | "month";

export const currentPeriodStart = (
  granularity: MissedBlocksGranularity,
  now: Date = new Date()
): string =>
  moment
    .utc(now)
    .startOf(granularity === "week" ? "isoWeek" : granularity)
    .format("YYYY-MM-DD");

// Drops the in-progress period, unless it is the only one.
export const completedTrend = (
  trend: MissedBlocksTrendPoint[],
  provisionalFrom: string
): MissedBlocksTrendPoint[] => {
  const completed = trend.filter((point) => point.period < provisionalFrom);
  return completed.length ? completed : trend;
};

// From the series, not the leaderboard, which limit_count truncates.
export const summariseTrend = (
  trend: MissedBlocksTrendPoint[]
): { missed: number; produced: number; rate: number; buckets: number } => {
  let missed = 0;
  let produced = 0;
  for (const point of trend) {
    missed += point.missed;
    produced += point.produced;
  }
  const scheduled = missed + produced;
  return {
    missed,
    produced,
    rate: scheduled > 0 ? missed / scheduled : 0,
    buckets: trend.length,
  };
};

export const formatMissRate = (rate: number, locale: string): string => {
  const pct = rate * 100;
  const digits = Number.isInteger(pct) ? 0 : pct < 1 ? 2 : 1;
  return `${pct.toLocaleString(locale, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}%`;
};
