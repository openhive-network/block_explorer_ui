import React, { useMemo } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useI18n } from "@/i18n/i18n";
import { cn } from "@/lib/utils";
import Hive from "@/types/Hive";
import {
  DappMetric,
  getCategoryColor,
  metricValue,
  metricShare,
  formatMetricValue,
} from "./networkDappUsageUtils";

const TOP_N = 15;

interface NetworkDappUsageBarProps {
  dapps: Hive.NetworkDappFootprintDapp[];
  category: string;
  metric: DappMetric;
}

// A CSS/HTML bar list (name on its own line, bar underneath) rather than an
// ECharts categorical axis — the widget can be narrow and axis labels clip.
const NetworkDappUsageBar: React.FC<NetworkDappUsageBarProps> = ({
  dapps,
  category,
  metric,
}) => {
  const { theme } = useTheme();
  const { t, locale } = useI18n();
  const isDark = theme === "dark";
  const baseColor = getCategoryColor(category, isDark);

  const rows = useMemo(() => {
    const total = dapps.reduce((s, d) => s + metricValue(d, metric), 0);
    const sorted = [...dapps].sort(
      (a, b) => metricValue(b, metric) - metricValue(a, metric)
    );
    const top = sorted.slice(0, TOP_N);
    const rest = sorted.slice(TOP_N);
    const list = top.map((d) => ({
      name: d.app_name,
      value: metricValue(d, metric),
      pct: metricShare(d, metric, total),
    }));
    if (rest.length) {
      list.push({
        name: t("networkDappUsage.otherDapps", { count: rest.length }),
        value: rest.reduce((s, d) => s + metricValue(d, metric), 0),
        pct: rest.reduce((s, d) => s + metricShare(d, metric, total), 0),
      });
    }
    return list;
  }, [dapps, metric, t]);

  const max = Math.max(...rows.map((r) => r.value), 1);

  return (
    <div className="space-y-2">
      {rows.map((r) => (
        <div key={r.name} title={r.name} className="px-1.5 py-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="min-w-0 truncate text-[12px] text-explorer-dark-gray dark:text-text">
              {r.name}
            </span>
            <span className="shrink-0 tabular-nums text-[11px] text-gray-500">
              {formatMetricValue(r.value, metric, locale)} ·{" "}
              {r.pct.toLocaleString(locale, { maximumFractionDigits: 1 })}%
            </span>
          </div>
          <div className="relative mt-1 h-2.5 w-full overflow-hidden rounded bg-gray-200 dark:bg-gray-700">
            <div
              className={cn("absolute inset-y-0 start-0 rounded")}
              style={{
                width: `${Math.max(2, (r.value / max) * 100)}%`,
                backgroundColor: baseColor,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default NetworkDappUsageBar;
