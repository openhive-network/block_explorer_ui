import Hive from "@/types/Hive";

export type HbdHealthGranularity = "daily" | "weekly" | "monthly" | "yearly";

// The DHF treasury account. Since HF24 the chain leaves its HBD out of the
// debt ratio that drives the HBD print stop and the haircut.
export const TREASURY_ACCOUNT = "hive.fund";

// HF24 (block 47,797,680), when the treasury exclusion started.
export const HF24_TIME = Date.parse("2020-10-14T19:31:24Z");

// The protocol's limits on the debt ratio changed twice (hived config.hpp):
// the HBD print stop (HIVE_HBD_STOP_PERCENT_*) and the haircut, where the
// artificial HBD price kicks in (HIVE_HBD_HARD_LIMIT*).
export const HBD_LIMIT_ERAS = [
  // HF26, block 68,676,505
  {
    from: Date.parse("2022-10-11T12:00:00Z"),
    printStopPct: 20,
    haircutPct: 30,
  },
  // HF20, block 26,256,743
  {
    from: Date.parse("2018-09-25T15:00:00Z"),
    printStopPct: 10,
    haircutPct: 10,
  },
  // HF14, block 5,137,542
  { from: Date.parse("2016-09-20T15:00:00Z"), printStopPct: 5, haircutPct: 10 },
];

export const hbdLimitsAt = (ms: number) =>
  HBD_LIMIT_ERAS.find((era) => ms >= era.from) ?? null;

// balance-api has no weekly buckets. Its daily rows are sampled at midnight,
// which is where hbd/status samples each week, so weekly joins daily rows.
export const treasuryGranularity = (
  granularity: HbdHealthGranularity
): "daily" | "monthly" | "yearly" =>
  granularity === "weekly" ? "daily" : granularity;

export interface HbdHealthPoint {
  // When the row was sampled: a period boundary, or now for the last row.
  date: string;
  // HBD value share of the virtual supply, counting every HBD (served).
  grossPct: number;
  // Same share with treasury HBD left out, as the protocol computes it.
  // Null when the treasury balance for this point isn't known.
  protocolPct: number | null;
  // Share of all HBD held by the treasury. Null when unknown.
  treasurySharePct: number | null;
  interestRatePct: number;
  hbdSupply: number;
  treasuryHbd: number | null;
  hiveSupply: number;
  // HIVE per HBD implied by the supplies (the median feed).
  priceHivePerHbd: number | null;
  // The protocol's limits in force at this point (null before HF14).
  printStopPct: number | null;
  haircutPct: number | null;
}

// Rows are labelled with their sampling time. Both routes end with a row for
// "now", sampled a few seconds apart, so those two are matched to each other.
const joinKey = (date: string, isLast: boolean): string => {
  const seconds = date.slice(0, 19);
  return isLast && !seconds.endsWith("T00:00:00") ? "latest" : seconds;
};

const toUtcMs = (date: string): number =>
  Date.parse(/[zZ]|[+-]\d\d:?\d\d$/.test(date) ? date : `${date}Z`);

// Treasury-adjusted HBD share:
//   price    = (virtual - hive) / hbd          HIVE per HBD
//   adj_hbd  = hbd - treasury
//   protocol = 100 * adj_hbd * price / (adj_hbd * price + hive)
// Before HF24 the treasury was not excluded, so it equals the gross share.
export const protocolRatioPct = (
  hbdSupply: number,
  hiveSupply: number,
  virtualSupply: number,
  treasuryHbd: number,
  sampledAtMs: number,
  grossPct: number
): number => {
  if (sampledAtMs < HF24_TIME || hbdSupply <= 0) return grossPct;
  const price = (virtualSupply - hiveSupply) / hbdSupply;
  const adjustedHbdInHive = Math.max(0, hbdSupply - treasuryHbd) * price;
  const total = adjustedHbdInHive + hiveSupply;
  return total > 0 ? (100 * adjustedHbdInHive) / total : 0;
};

export const buildHbdHealth = (
  status: Hive.HbdStatusResponse[] | undefined,
  treasury: Hive.AccountAggregatedBalanceHistoryResponse[] | undefined
): HbdHealthPoint[] => {
  if (!status?.length) return [];

  const treasuryByKey = new Map<string, number>();
  (treasury ?? []).forEach((row, i, rows) => {
    const date = String(row.date);
    const balance = Number(row.balance?.balance);
    if (Number.isFinite(balance))
      treasuryByKey.set(joinKey(date, i === rows.length - 1), balance / 1000);
  });

  return status.map((row, i) => {
    const hbdSupply = Number(row.hbd_supply) / 1000;
    const hiveSupply = Number(row.hive_supply) / 1000;
    const virtualSupply = Number(row.virtual_supply) / 1000;
    const grossPct = Number(row.debt_ratio_gross_pct);
    const treasuryHbd =
      treasuryByKey.get(joinKey(row.period, i === status.length - 1)) ?? null;
    const sampledAtMs = toUtcMs(row.period);
    const preHf24 = sampledAtMs < HF24_TIME;
    const limits = hbdLimitsAt(sampledAtMs);

    return {
      date: row.period,
      grossPct,
      protocolPct:
        treasuryHbd === null && !preHf24
          ? null
          : protocolRatioPct(
              hbdSupply,
              hiveSupply,
              virtualSupply,
              treasuryHbd ?? 0,
              sampledAtMs,
              grossPct
            ),
      treasurySharePct:
        treasuryHbd === null || hbdSupply <= 0
          ? null
          : (100 * treasuryHbd) / hbdSupply,
      interestRatePct: Number(row.hbd_interest_rate) / 100,
      hbdSupply,
      treasuryHbd,
      hiveSupply,
      priceHivePerHbd:
        hbdSupply > 0 ? (virtualSupply - hiveSupply) / hbdSupply : null,
      printStopPct: limits?.printStopPct ?? null,
      haircutPct: limits?.haircutPct ?? null,
    };
  });
};
