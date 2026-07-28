import Hive from "@/types/Hive";
import { formatRc } from "../networkRcUtils";

export type CustomJsonMetric = "ops" | "bytes" | "rc";

const CATEGORY_COLORS: Record<string, { light: string; dark: string }> = {
  Gaming: { light: "#0072B2", dark: "#3f97d8" },
  "DeFi & Tokens": { light: "#009E73", dark: "#0f9e78" },
  "Governance & Infrastructure": { light: "#D55E00", dark: "#d4601c" },
  "Social Front-Ends": { light: "#CC79A7", dark: "#bd6f99" },
  "Social Graph": { light: "#7b5cc4", dark: "#7d63c4" },
  "Community & Social DApps": { light: "#56B4E9", dark: "#4b93c9" },
  NFTs: { light: "#E69F00", dark: "#bd8020" },
  "Media & Content": { light: "#a6761d", dark: "#a86a1f" },
};

export const OTHER_COLOR = { light: "#9ca3af", dark: "#6b7280" };

export const getCategoryColor = (category: string, isDark: boolean): string => {
  const entry = CATEGORY_COLORS[category];
  if (entry) return isDark ? entry.dark : entry.light;
  return isDark ? OTHER_COLOR.dark : OTHER_COLOR.light;
};

export const isColoredCategory = (category: string): boolean =>
  Object.prototype.hasOwnProperty.call(CATEGORY_COLORS, category);

// Fold non-palette categories into one neutral "Other" row, preserving totals.
export const foldCategories = (
  categories: Hive.NetworkTopCustomJsonRow[],
  metric: CustomJsonMetric,
  otherLabel: string
): Hive.NetworkTopCustomJsonRow[] => {
  const colored = categories.filter((c) => isColoredCategory(c.category));
  const rest = categories.filter((c) => !isColoredCategory(c.category));
  const folded = [...colored].sort(
    (a, b) => metricValue(b, metric) - metricValue(a, metric)
  );
  if (!rest.length) return folded;
  folded.push({
    ...rest[0],
    category: otherLabel,
    json_id: null,
    app_name: null,
    op_count: rest.reduce((s, r) => s + (r.op_count || 0), 0),
    op_bytes: rest.reduce((s, r) => s + (r.op_bytes || 0), 0),
    rc_estimate: rest.reduce((s, r) => s + (r.rc_estimate || 0), 0),
  });
  return folded;
};

export interface DonutSlice {
  name: string;
  value: number;
  color: string;
}

export const buildCategorySlices = (
  categories: Hive.NetworkTopCustomJsonRow[],
  metric: CustomJsonMetric,
  isDark: boolean,
  othersLabel: string
): DonutSlice[] =>
  foldCategories(categories, metric, othersLabel)
    .map((c) => ({
      name: c.category,
      value: metricValue(c, metric),
      color: getCategoryColor(c.category, isDark),
    }))
    .filter((s) => s.value > 0);

type MetricRow = { op_count: number; op_bytes: number; rc_estimate: number };

export const metricValue = (
  row: MetricRow,
  metric: CustomJsonMetric
): number =>
  metric === "rc"
    ? row.rc_estimate
    : metric === "bytes"
      ? row.op_bytes
      : row.op_count;

export const formatBytes = (bytes: number, locale: string): string => {
  if (!isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const v = bytes / Math.pow(1024, i);
  return `${v.toLocaleString(locale, {
    maximumFractionDigits: v < 10 && i > 0 ? 1 : 0,
  })} ${units[i]}`;
};

export const formatMetricValue = (
  value: number,
  metric: CustomJsonMetric,
  locale: string
): string =>
  metric === "rc"
    ? formatRc(value, locale)
    : metric === "bytes"
      ? formatBytes(value, locale)
      : value.toLocaleString(locale, { maximumFractionDigits: 0 });

type GroupBy = "id" | "app" | "category";

export const rowLabelFor = (
  row: Hive.NetworkTopCustomJsonRow,
  groupBy: GroupBy
): string => {
  if (groupBy === "category") return row.category || "—";
  if (groupBy === "app") return row.app_name || row.json_id || "—";
  return row.json_id || row.app_name || "—";
};

// Secondary muted label: in "By id" mode show which app the id belongs to.
export const rowSubLabelFor = (
  row: Hive.NetworkTopCustomJsonRow,
  groupBy: GroupBy
): string | null =>
  groupBy === "id" && row.app_name && row.app_name !== row.json_id
    ? row.app_name
    : null;

// Homepage link for a row, joined from the static registry by app name.
export const homepageFor = (
  row: Hive.NetworkTopCustomJsonRow,
  registry: Hive.CustomJsonAppRegistryRow[] | undefined
): string | null => {
  if (!registry?.length || !row.app_name) return null;
  return registry.find((r) => r.app_name === row.app_name)?.homepage || null;
};

export interface CustomJsonKpis {
  totalOps: number;
  totalBytes: number;
  totalRc: number;
  topCategory: string | null;
  topCategoryShare: number;
  categoryCount: number;
}

// Snapshot KPIs from the category-level leaderboard, which covers every op
// (each custom_json belongs to exactly one category).
export const computeCustomJsonKpis = (
  categories: Hive.NetworkTopCustomJsonRow[] | undefined,
  metric: CustomJsonMetric
): CustomJsonKpis | null => {
  if (!categories?.length) return null;
  const totalOps = categories.reduce((s, r) => s + (r.op_count || 0), 0);
  const totalBytes = categories.reduce((s, r) => s + (r.op_bytes || 0), 0);
  const totalRc = categories.reduce((s, r) => s + (r.rc_estimate || 0), 0);
  const metricTotal = categories.reduce(
    (s, r) => s + metricValue(r, metric),
    0
  );
  const top = [...categories].sort(
    (a, b) => metricValue(b, metric) - metricValue(a, metric)
  )[0];
  return {
    totalOps,
    totalBytes,
    totalRc,
    topCategory: top?.category ?? null,
    topCategoryShare:
      metricTotal > 0 && top
        ? (metricValue(top, metric) / metricTotal) * 100
        : 0,
    categoryCount: categories.length,
  };
};
