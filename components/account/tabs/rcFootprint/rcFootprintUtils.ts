import Hive from "@/types/Hive";
import { formatRc } from "@/components/home/networkRcUtils";

export { formatRc };

export type FootprintMetric = "ops" | "rc";

// Fixed, validated categorical hue order (dataviz reference palette). Colour
// follows the category identity, never its rank — so a filter/sort never
// repaints a category. Categories not in the map fall back to the muted grey.
const CATEGORY_COLORS: Record<string, { light: string; dark: string }> = {
  "Social Graph": { light: "#2a78d6", dark: "#3987e5" },
  "Social Front-Ends": { light: "#1baf7a", dark: "#199e70" },
  Gaming: { light: "#eda100", dark: "#c98500" },
  "DeFi & Tokens": { light: "#008300", dark: "#008300" },
  NFTs: { light: "#4a3aa7", dark: "#9085e9" },
  "Media & Content": { light: "#e34948", dark: "#e66767" },
  "Community & Social DApps": { light: "#e87ba4", dark: "#d55181" },
  "Governance & Infrastructure": { light: "#eb6834", dark: "#d95926" },
};

const FALLBACK_COLOR = { light: "#898781", dark: "#898781" };

export const getCategoryColor = (category: string, isDark: boolean): string => {
  const entry = CATEGORY_COLORS[category] ?? FALLBACK_COLOR;
  return isDark ? entry.dark : entry.light;
};

// Metric-aware accessors so the donut/bar/KPI read one figure consistently.
export const metricValue = (
  item: { op_count: number; rc_estimated: number },
  metric: FootprintMetric
): number => (metric === "rc" ? item.rc_estimated : item.op_count);

export const metricPct = (
  item: { pct: number; rc_pct: number },
  metric: FootprintMetric
): number => (metric === "rc" ? item.rc_pct : item.pct);

export const formatMetricValue = (
  value: number,
  metric: FootprintMetric,
  locale: string
): string =>
  metric === "rc"
    ? formatRc(value, locale)
    : value.toLocaleString(locale, { maximumFractionDigits: 0 });

export const dappsForCategory = (
  data: Hive.AccountDappFootprintResponse | undefined,
  category: string | null
): Hive.AccountDappFootprintDapp[] => {
  if (!data || !category) return [];
  return data.dapps
    .filter((d) => d.category === category)
    .sort((a, b) => b.op_count - a.op_count);
};
