import moment from "moment";
import { IHiveChainInterface } from "@hiveio/wax";
import Hive from "@/types/Hive";
import { convertVestsToHP } from "@/utils/Calculations";
import { grabNumericValue } from "@/utils/StringUtils";

export type Granularity = "day" | "week" | "month";
export type ActivityView = "activity" | "rewards";

// HIVE/HBD nai amounts are integers in milli-units (3 decimals).
const LIQUID_PRECISION = 3;

// Rolling window sizes per granularity (periods shown, including the current one).
export const WINDOW_SIZE: Record<Granularity, number> = {
  day: 30,
  week: 26,
  month: 12,
};

const UNIT: Record<Granularity, moment.unitOfTime.StartOf> = {
  day: "day",
  week: "isoWeek",
  month: "month",
};

const STEP: Record<Granularity, moment.unitOfTime.DurationConstructor> = {
  day: "days",
  week: "weeks",
  month: "months",
};

// Start of the rolling window, aligned to the granularity boundary. Passed to the
// API as `from_date` and reused to build a continuous, gap-free period axis.
export const windowStart = (granularity: Granularity): Date =>
  moment()
    .startOf(UNIT[granularity])
    .subtract(WINDOW_SIZE[granularity] - 1, STEP[granularity])
    .toDate();

export interface FilledRow extends Hive.AccountContentStatsResponse {
  isCurrent: boolean;
}

const emptyRow = (period: string, isCurrent: boolean): FilledRow => ({
  period,
  posts: 0,
  comments: 0,
  votes_cast: 0,
  votes_received: 0,
  replies_received: 0,
  author_reward_hive_nai: 0,
  author_reward_hbd_nai: 0,
  author_reward_vests_nai: 0,
  isCurrent,
});

// The API only returns periods that have activity, so gaps are back-filled with
// zeroed rows to keep the timeline continuous. The last period (the current,
// still-accruing one) is flagged so callers can mark it and exclude it from
// totals. The axis starts at `fromDate` when it is a real Date (an explicit
// window); when it is a block number or omitted, it starts at the earliest
// returned period instead.
export const buildPeriods = (
  data: Hive.AccountContentStatsResponse[] | undefined,
  granularity: Granularity,
  fromDate?: Date | number,
  toDate?: Date | number
): { rows: FilledRow[]; currentKey: string } => {
  const unit = UNIT[granularity];
  const currentKey = moment().startOf(unit).format("YYYY-MM-DD");
  const byPeriod = new Map<string, Hive.AccountContentStatsResponse>();
  (data ?? []).forEach((d) => byPeriod.set(d.period, d));

  const dataKeys = [...byPeriod.keys()].sort();
  let startKey =
    fromDate instanceof Date
      ? moment(fromDate).startOf(unit).format("YYYY-MM-DD")
      : dataKeys[0];
  // Never start after the first period that actually has data.
  if (dataKeys[0] && (!startKey || dataKeys[0] < startKey))
    startKey = dataKeys[0];
  if (!startKey) return { rows: [], currentKey };

  // End at the window's `to` when given (else the current period); never before
  // the last period with data.
  const lastKey = dataKeys[dataKeys.length - 1];
  const toKey =
    toDate instanceof Date
      ? moment(toDate).startOf(unit).format("YYYY-MM-DD")
      : undefined;
  let endKey =
    toKey ?? (lastKey && lastKey > currentKey ? lastKey : currentKey);
  if (lastKey && lastKey > endKey) endKey = lastKey;

  const rows: FilledRow[] = [];
  const cursor = moment(startKey);
  const end = moment(endKey);
  while (cursor.isSameOrBefore(end)) {
    const key = cursor.format("YYYY-MM-DD");
    const isCurrent = key === currentKey;
    const match = byPeriod.get(key);
    rows.push(match ? { ...match, isCurrent } : emptyRow(key, isCurrent));
    cursor.add(1, STEP[granularity]);
  }
  return { rows, currentKey };
};

export interface RewardRow {
  period: string;
  isCurrent: boolean;
  hive: number;
  hbd: number;
  hp: number;
}

// Converts the reward nai columns into display units. Vests are turned into HP via
// the shared convertVestsToHP helper (never hand-rolled) so results match the rest
// of the app.
export const buildRewardRows = (
  rows: FilledRow[],
  hiveChain: IHiveChainInterface | undefined,
  dynamicGlobalData: any
): RewardRow[] => {
  const fund = dynamicGlobalData?.headBlockDetails?.rawTotalVestingFundHive;
  const shares = dynamicGlobalData?.headBlockDetails?.rawTotalVestingShares;
  const canConvert = !!hiveChain && !!fund && !!shares;

  return rows.map((r) => {
    let hp = 0;
    if (canConvert && r.author_reward_vests_nai > 0) {
      const hpStr = convertVestsToHP(
        hiveChain!,
        String(r.author_reward_vests_nai),
        fund,
        shares
      );
      hp = grabNumericValue(hpStr ?? "0");
    }
    return {
      period: r.period,
      isCurrent: r.isCurrent,
      hive: r.author_reward_hive_nai / Math.pow(10, LIQUID_PRECISION),
      hbd: r.author_reward_hbd_nai / Math.pow(10, LIQUID_PRECISION),
      hp,
    };
  });
};

// Axis date format per granularity.
export const periodFormat = (granularity: Granularity): string =>
  granularity === "month" ? "MMM YYYY" : "MMM D";

export const periodFormatLong = (granularity: Granularity): string =>
  granularity === "month" ? "MMM YYYY" : "MMM D, YYYY";
