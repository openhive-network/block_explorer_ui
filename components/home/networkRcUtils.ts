import moment from "moment";
import Hive from "@/types/Hive";
import { getOperationTypeForDisplay } from "@/utils/UI";

export const CLAIM_ACCOUNT_OP = "claim_account_operation";

export type RcGranularity = "day" | "week" | "month";

// RC values are enormous (up to ~1e17), so scale into T/P/E. RC is a calibrated
// estimate, so low-digit precision loss from JSON number parsing is irrelevant.
export const formatRc = (n: number, locale: string): string => {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  const units: [number, string][] = [
    [1e18, "E"],
    [1e15, "P"],
    [1e12, "T"],
    [1e9, "B"],
    [1e6, "M"],
    [1e3, "K"],
  ];
  for (const [threshold, unit] of units) {
    if (abs >= threshold)
      return (
        sign +
        (abs / threshold).toLocaleString(locale, { maximumFractionDigits: 2 }) +
        unit
      );
  }
  return sign + abs.toLocaleString(locale, { maximumFractionDigits: 0 });
};

// "vote_operation" -> "Vote", "custom_json_operation" -> "Custom Json".
export const formatOpLabel = (opName: string): string => {
  const base = getOperationTypeForDisplay(opName) || opName;
  return base
    .split("_")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

export interface RcOpAgg {
  op: string;
  value: number;
}

// Aggregates RC per operation across the window (optionally excluding account
// claims), sorted by RC descending. Feeds the treemap and the card breakdown.
export const aggregateRcByOp = (
  data: Hive.NetworkRcUtilizationResponse[],
  includeClaims: boolean
): { ops: RcOpAgg[]; total: number } => {
  const totals = new Map<string, number>();
  let total = 0;
  data.forEach((d) =>
    Object.entries(d.by_label ?? {}).forEach(([op, v]) => {
      if (!includeClaims && op === CLAIM_ACCOUNT_OP) return;
      totals.set(op, (totals.get(op) ?? 0) + v);
      total += v;
    })
  );
  const ops = [...totals.entries()]
    .map(([op, value]) => ({ op, value }))
    .sort((a, b) => b.value - a.value);
  return { ops, total };
};

// Start of the in-progress period in UTC (the API buckets by UTC) — rows on/after
// this are partial and excluded from KPIs/averages/trend (the chart may still
// show them). Using UTC avoids counting the in-progress day for non-UTC users.
export const currentRcPeriodStart = (granularity: RcGranularity): string =>
  moment
    .utc()
    .startOf(
      granularity === "day"
        ? "day"
        : granularity === "week"
          ? "isoWeek"
          : "month"
    )
    .format("YYYY-MM-DD");
