import React, { useMemo } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useI18n } from "@/i18n/i18n";
import { cn } from "@/lib/utils";
import Hive from "@/types/Hive";
import {
  FootprintMetric,
  getCategoryColor,
  metricValue,
  metricPct,
  formatMetricValue,
} from "./rcFootprintUtils";

const TOP_N = 15;

interface RcFootprintDappBarProps {
  dapps: Hive.AccountDappFootprintDapp[];
  category: string;
  metric: FootprintMetric;
  selectedDapp: string | null;
  onSelectDapp: (dapp: string) => void;
}

// A CSS/HTML bar list (name on its own line, bar underneath) rather than an
// ECharts categorical axis — the widget can be narrow and axis labels clip.
const RcFootprintDappBar: React.FC<RcFootprintDappBarProps> = ({
  dapps,
  category,
  metric,
  selectedDapp,
  onSelectDapp,
}) => {
  const { theme } = useTheme();
  const { t, locale } = useI18n();
  const isDark = theme === "dark";
  const baseColor = getCategoryColor(category, isDark);

  const rows = useMemo(() => {
    const sorted = [...dapps].sort(
      (a, b) => metricValue(b, metric) - metricValue(a, metric)
    );
    const top = sorted.slice(0, TOP_N);
    const rest = sorted.slice(TOP_N);
    const list = top.map((d) => ({
      name: d.app_name,
      value: metricValue(d, metric),
      pct: metricPct(d, metric),
      clickable: true,
    }));
    if (rest.length) {
      list.push({
        name: t("rcFootprint.otherDapps", { count: rest.length }),
        value: rest.reduce((s, d) => s + metricValue(d, metric), 0),
        pct: rest.reduce((s, d) => s + metricPct(d, metric), 0),
        clickable: false,
      });
    }
    return list;
  }, [dapps, metric, t]);

  const max = Math.max(...rows.map((r) => r.value), 1);
  const hasSelection = !!selectedDapp;

  return (
    <div className="space-y-2">
      {rows.map((r) => {
        const isSel = r.name === selectedDapp;
        return (
          <button
            key={r.name}
            type="button"
            onClick={() => r.clickable && onSelectDapp(r.name)}
            disabled={!r.clickable}
            title={r.name}
            className={cn(
              "w-full rounded px-1.5 py-1 text-start transition-colors",
              r.clickable
                ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                : "cursor-default",
              isSel &&
                "bg-gray-100 dark:bg-gray-800 ring-1 ring-inset ring-indigo-400/60"
            )}
          >
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
                className="absolute inset-y-0 start-0 rounded"
                style={{
                  width: `${Math.max(2, (r.value / max) * 100)}%`,
                  backgroundColor: baseColor,
                  opacity: hasSelection && !isSel ? 0.4 : 1,
                }}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default RcFootprintDappBar;
