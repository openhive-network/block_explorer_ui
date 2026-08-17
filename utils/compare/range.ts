import { config } from "@/Config";

// Shared date-range for the windowed comparison rows/charts.
export type CompareRange = "30d" | "90d" | "1y" | "all";

export const COMPARE_RANGES: CompareRange[] = ["30d", "90d", "1y", "all"];

export interface CompareWindow {
  fromDate: Date;
  toDate: Date;
  granularity: "day" | "week" | "month";
}

// Resolve a range to a concrete window + a sensible series granularity. Callers
// must memoize on the range so the resulting Dates (and thus query keys) are
// stable across renders.
export const rangeToWindow = (range: CompareRange): CompareWindow => {
  const toDate = new Date();
  const fromDate = new Date(toDate);
  if (range === "30d") {
    fromDate.setUTCDate(fromDate.getUTCDate() - 30);
    return { fromDate, toDate, granularity: "day" };
  }
  if (range === "90d") {
    fromDate.setUTCDate(fromDate.getUTCDate() - 90);
    return { fromDate, toDate, granularity: "week" };
  }
  // First block, not account creation, so both sides span the same window.
  if (range === "all") {
    return {
      fromDate: new Date(config.firstBlockTime),
      toDate,
      granularity: "month",
    };
  }
  fromDate.setUTCFullYear(fromDate.getUTCFullYear() - 1);
  return { fromDate, toDate, granularity: "month" };
};
