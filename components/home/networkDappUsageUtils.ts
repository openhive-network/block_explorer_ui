import Hive from "@/types/Hive";
import { formatRc } from "./networkRcUtils";

export type DappMetric = "ops" | "rc" | "users";

// Structural shape shared by category and dapp rows so one accessor reads both.
type MetricItem = {
  op_count: number;
  rc_estimated: number;
  unique_accounts: number | null;
  pct: number;
  rc_pct: number;
};

// Fixed, validated categorical hue order (dataviz reference palette), matching
// the account-level DApp report so the same category keeps the same colour on
// both surfaces. Colour follows the category identity, never its rank — a
// filter/sort never repaints a category. Unknown categories fall back to grey.
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

// Metric-aware accessors so the donut/bar/KPIs read one figure consistently.
export const metricValue = (item: MetricItem, metric: DappMetric): number =>
  metric === "rc"
    ? item.rc_estimated
    : metric === "users"
      ? (item.unique_accounts ?? 0)
      : item.op_count;

// Share of the shown total. Ops/RC carry a backend percentage; the users share
// is derived here (unique accounts aren't additive across DApps — one account
// can use many — so this is an approximate share of the summed counts).
export const metricShare = (
  item: MetricItem,
  metric: DappMetric,
  total: number
): number =>
  metric === "ops"
    ? item.pct
    : metric === "rc"
      ? item.rc_pct
      : total > 0
        ? (metricValue(item, "users") / total) * 100
        : 0;

export const formatMetricValue = (
  value: number,
  metric: DappMetric,
  locale: string
): string =>
  metric === "rc"
    ? formatRc(value, locale)
    : value.toLocaleString(locale, { maximumFractionDigits: 0 });

// The Users metric is only offered when the backend actually returns per-DApp
// unique-account counts (the ticket's optional network value-add).
export const hasUniqueAccounts = (
  data: Hive.NetworkDappFootprintResponse | undefined
): boolean => !!data && data.dapps.some((d) => d.unique_accounts != null);

export const dappsForCategory = (
  data: Hive.NetworkDappFootprintResponse | undefined,
  category: string | null,
  metric: DappMetric = "ops"
): Hive.NetworkDappFootprintDapp[] => {
  if (!data || !category) return [];
  return data.dapps
    .filter((d) => d.category === category)
    .sort((a, b) => metricValue(b, metric) - metricValue(a, metric));
};
