import React, { useMemo } from "react";
import moment from "moment";
import EChart from "@/components/ui/EChart";
import Hive from "@/types/Hive";
import { useI18n } from "@/i18n/i18n";
import { useTheme } from "@/contexts/ThemeContext";
import { formatCompact } from "@/utils/chartUtils";

export type HeatmapViewMode = "rates" | "counts";

const NEW_COL_IDX = 0;

const RETENTION_COLS = [
  {
    key: "pct_7d" as const,
    countKey: "active_at_7d" as const,
    label: "7D",
    xIdx: 1,
  },
  {
    key: "pct_30d" as const,
    countKey: "active_at_30d" as const,
    label: "30D",
    xIdx: 2,
  },
  {
    key: "pct_90d" as const,
    countKey: "active_at_90d" as const,
    label: "90D",
    xIdx: 3,
  },
];

// ECharts heatmap requires numeric values; -1 signals "no data" so visualMap can style it as empty
const NULL_SENTINEL = -1;

const getPctBg = (pct: number, isDark: boolean): string => {
  if (pct < 0) return isDark ? "#334155" : "#f1f5f9";
  if (pct < 10) return isDark ? "#881337" : "#fee2e2";
  if (pct < 30) return isDark ? "#9a3412" : "#fef3c7";
  if (pct < 50) return isDark ? "#166534" : "#d1fae5";
  if (pct < 70) return isDark ? "#15803d" : "#86efac";
  return isDark ? "#16a34a" : "#34d399";
};
const getPctText = (pct: number, isDark: boolean): string => {
  if (pct < 0) return isDark ? "#64748b" : "#9ca3af";
  if (pct < 10) return isDark ? "#fda4af" : "#b91c1c";
  if (pct < 30) return isDark ? "#fdba74" : "#92400e";
  return isDark ? "#bbf7d0" : "#065f46";
};

const getCountBg = (t: number, isDark: boolean): string => {
  if (t < 0) return isDark ? "#334155" : "#f1f5f9";
  if (isDark) {
    // high t = more saturated (darker), low t = lighter — high value more prominent
    if (t < 0.33) return "#a78bfa";
    if (t < 0.66) return "#8b5cf6";
    return "#7c3aed";
  }
  if (t < 0.33) return "#ede9fe";
  if (t < 0.66) return "#c4b5fd";
  return "#8b5cf6";
};
const getCountText = (t: number, isDark: boolean): string => {
  if (t < 0) return isDark ? "#64748b" : "#9ca3af";
  if (isDark) return t < 0.33 ? "#2e1065" : "#f5f3ff";
  return t < 0.66 ? "#5b21b6" : "#f5f3ff";
};

const getNewBg = (t: number, isDark: boolean): string => {
  if (isDark) {
    // high t = more saturated (darker), low t = lighter — high value more prominent
    if (t < 0.33) return "#818cf8";
    if (t < 0.66) return "#6366f1";
    return "#4f46e5";
  }
  if (t < 0.33) return "#e0e7ff";
  if (t < 0.66) return "#a5b4fc";
  return "#6366f1";
};
const getNewText = (t: number, isDark: boolean): string => {
  if (isDark) return t < 0.33 ? "#312e81" : "#e0e7ff";
  return t < 0.66 ? "#3730a3" : "#e0e7ff";
};

interface AccountRetentionHeatmapProps {
  data: Hive.AccountFunnelResponse[];
  compact?: boolean;
  viewMode?: HeatmapViewMode;
  showLegend?: boolean;
}

export const LEGEND_ITEMS = [
  {
    range: "<10%",
    lightBg: "#fee2e2",
    darkBg: "#881337",
    lightText: "#b91c1c",
    darkText: "#fda4af",
  },
  {
    range: "10–30%",
    lightBg: "#fef3c7",
    darkBg: "#9a3412",
    lightText: "#92400e",
    darkText: "#fdba74",
  },
  {
    range: "30–50%",
    lightBg: "#d1fae5",
    darkBg: "#166534",
    lightText: "#065f46",
    darkText: "#bbf7d0",
  },
  {
    range: "50–70%",
    lightBg: "#86efac",
    darkBg: "#15803d",
    lightText: "#065f46",
    darkText: "#bbf7d0",
  },
  {
    range: "≥70%",
    lightBg: "#34d399",
    darkBg: "#16a34a",
    lightText: "#065f46",
    darkText: "#bbf7d0",
  },
];

const AccountRetentionHeatmap: React.FC<AccountRetentionHeatmapProps> = ({
  data,
  compact = false,
  viewMode = "rates",
  showLegend = false,
}) => {
  const { t, locale, dir } = useI18n();
  const isRTL = dir === "rtl";
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const tRetention = t("accountRetentionFunnelCard.heatmapRetention");
  const tAccounts = t("accountRetentionFunnelCard.heatmapAccounts");
  const tNewAccounts = t("accountRetentionFunnelCard.newAccounts");
  const tDataPending = t("accountRetentionFunnelCard.heatmapDataPending");
  const tSurvivalNote = t("accountRetentionFunnelCard.survivalNote");

  const months = useMemo(
    () =>
      data.map((d) =>
        moment(d.cohort_month, "YYYY-MM").locale(locale).format("MMM YYYY")
      ),
    [data, locale]
  );

  const { minNew, maxNew } = useMemo(() => {
    if (!data.length) return { minNew: 0, maxNew: 0 };
    const vals = data.map((r) => r.new_accounts);
    return { minNew: Math.min(...vals), maxNew: Math.max(...vals) };
  }, [data]);

  const { minActive, maxActive } = useMemo(() => {
    if (viewMode !== "counts" || !data.length)
      return { minActive: 0, maxActive: 0 };
    const vals = data.flatMap((r) =>
      [r.active_at_7d, r.active_at_30d, r.active_at_90d].filter(
        (v): v is number => v !== null
      )
    );
    if (!vals.length) return { minActive: 0, maxActive: 0 };
    return { minActive: Math.min(...vals), maxActive: Math.max(...vals) };
  }, [data, viewMode]);

  const textColor = isDark ? "#e5e7eb" : "#374151";
  const mutedColor = isDark ? "#9ca3af" : "#6b7280";

  const seriesData = useMemo(() => {
    const newRange = maxNew - minNew || 1;
    const activeRange = maxActive - minActive || 1;
    const br = compact ? 4 : 6;

    const makeRetentionCell = (
      xIdx: number,
      yIdx: number,
      pct: number | null,
      activeCount: number | null
    ) => {
      if (viewMode === "counts") {
        const val = activeCount !== null ? activeCount : NULL_SENTINEL;
        const tNorm = val >= 0 ? (val - minActive) / activeRange : -1;
        return {
          value: [xIdx, yIdx, val],
          itemStyle: { color: getCountBg(tNorm, isDark), borderRadius: br },
          label: { color: getCountText(tNorm, isDark) },
        };
      }
      const val = pct !== null ? pct : NULL_SENTINEL;
      return {
        value: [xIdx, yIdx, val],
        itemStyle: { color: getPctBg(val, isDark), borderRadius: br },
        label: { color: getPctText(val, isDark) },
      };
    };

    return data.flatMap((row, yIdx) => {
      const retCells = RETENTION_COLS.map((col) =>
        makeRetentionCell(col.xIdx, yIdx, row[col.key], row[col.countKey])
      );
      const tNorm = (row.new_accounts - minNew) / newRange;
      const newCell = {
        value: [NEW_COL_IDX, yIdx, row.new_accounts],
        itemStyle: { color: getNewBg(tNorm, isDark), borderRadius: br },
        label: { color: getNewText(tNorm, isDark) },
      };
      return [...retCells, newCell];
    });
  }, [data, isDark, compact, viewMode, minNew, maxNew, minActive, maxActive]);

  const option = useMemo(() => {
    const xAxisLabels = [tNewAccounts, ...RETENTION_COLS.map((c) => c.label)];

    return {
      animation: false,
      visualMap: {
        min: NULL_SENTINEL,
        max: 100,
        show: false,
        inRange: { color: [isDark ? "#1f2937" : "#f3f4f6", "#34d399"] },
      },
      grid: {
        top: compact ? 26 : 32,
        left: isRTL ? (compact ? 8 : 16) : compact ? 58 : 74,
        right: isRTL ? (compact ? 58 : 74) : compact ? 8 : 16,
        bottom: compact ? 4 : 8,
      },
      xAxis: {
        type: "category",
        data: xAxisLabels,
        position: "top",
        inverse: isRTL,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: isDark ? "#ffffff" : "#000000",
          fontSize: compact ? 10 : 12,
          fontWeight: 500,
          margin: compact ? 4 : 6,
          interval: 0,
          rich: {
            new: {
              color: isDark ? "#818cf8" : "#4338ca",
              fontWeight: 600,
              fontSize: compact ? 10 : 12,
            },
          },
          formatter: (value: string) => {
            if (value === tNewAccounts) {
              const label = compact ? value.split(" ")[0] : value;
              return `{new|${label}}`;
            }
            return value;
          },
        },
        splitLine: { show: false },
      },
      yAxis: {
        type: "category",
        position: isRTL ? "right" : "left",
        data: months,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: textColor,
          fontSize: compact ? 10 : 11,
        },
        splitLine: { show: false },
      },
      tooltip: {
        trigger: "item",
        formatter: (params: { value: [number, number, number] }) => {
          const [xIdx, yIdx, rawVal] = params.value;
          const monthLabel = months[yIdx];

          if (xIdx === NEW_COL_IDX) {
            return `
              <div style="line-height:1.6;min-width:160px">
                <div style="font-weight:700;font-size:12px;margin-bottom:3px">${monthLabel}</div>
                <div style="font-size:11px">${tNewAccounts}: <strong>${rawVal.toLocaleString(locale)}</strong></div>
              </div>`;
          }

          const col = RETENTION_COLS.find((c) => c.xIdx === xIdx)!;
          const row = data[yIdx];

          if (viewMode === "counts") {
            const countText =
              rawVal >= 0 ? rawVal.toLocaleString(locale) : tDataPending;
            const newLine = `<div style="font-size:10px;color:${mutedColor};margin-top:1px">${tNewAccounts}: <strong style="color:${textColor}">${row.new_accounts.toLocaleString(locale)}</strong></div>`;
            return `
              <div style="line-height:1.6;min-width:160px">
                <div style="font-weight:700;font-size:12px;margin-bottom:3px">${monthLabel}</div>
                ${newLine}
                <div style="font-size:11px;margin-top:4px">${col.label}: <strong>${countText}</strong> ${tAccounts}</div>
              </div>`;
          }

          const pctText =
            rawVal >= 0
              ? `${rawVal.toLocaleString(locale, { maximumFractionDigits: 1 })}%`
              : "—";
          const newLine = `<div style="font-size:10px;color:${mutedColor};margin-top:1px">${tNewAccounts}: <strong style="color:${textColor}">${row.new_accounts.toLocaleString(locale)}</strong></div>`;
          const activeCount = row[col.countKey];
          const countLine =
            activeCount !== null
              ? `<div style="font-size:10px;color:${mutedColor};margin-top:2px">${activeCount.toLocaleString(locale)} ${tAccounts}</div>`
              : rawVal >= 0
                ? ""
                : `<div style="font-size:10px;color:${mutedColor};margin-top:2px">${tDataPending}</div>`;
          return `
            <div style="line-height:1.6;min-width:160px">
              <div style="font-weight:700;font-size:12px;margin-bottom:3px">${monthLabel}</div>
              ${newLine}
              <div style="font-size:11px;margin-top:4px">${col.label} ${tRetention}: <strong>${pctText}</strong></div>
              ${countLine}
              <div style="font-size:10px;color:${mutedColor};margin-top:4px;max-width:200px;white-space:normal">${tSurvivalNote}</div>
            </div>`;
        },
        backgroundColor: isDark ? "#1f2937" : "#ffffff",
        borderColor: isDark ? "#374151" : "#e5e7eb",
        borderRadius: 8,
        textStyle: { color: textColor, fontSize: 11 },
        extraCssText: `box-shadow: 0 4px 12px rgba(0,0,0,0.15); direction: ${isRTL ? "rtl" : "ltr"};`,
        confine: true,
      },
      series: [
        {
          type: "heatmap",
          data: seriesData,
          label: {
            show: true,
            fontSize: compact ? 10 : 11,
            fontWeight: 500,
            formatter: (params: { value: [number, number, number] }) => {
              const [xIdx, , rawVal] = params.value;
              if (xIdx === NEW_COL_IDX) return formatCompact(rawVal, locale);
              if (viewMode === "counts")
                return rawVal >= 0 ? formatCompact(rawVal, locale) : "—";
              return rawVal >= 0
                ? `${rawVal.toLocaleString(locale, { maximumFractionDigits: 1 })}%`
                : "—";
            },
          },
          emphasis: {
            itemStyle: { shadowBlur: 12, shadowColor: "rgba(0,0,0,0.2)" },
          },
        },
      ],
    };
  }, [
    isRTL,
    data,
    months,
    seriesData,
    compact,
    isDark,
    textColor,
    mutedColor,
    locale,
    viewMode,
    tRetention,
    tAccounts,
    tNewAccounts,
    tDataPending,
    tSurvivalNote,
  ]);

  const rowH = compact ? 22 : 36;
  const chartH = Math.max(compact ? 100 : 240, data.length * rowH + 52);

  return (
    <div style={{ width: "100%" }}>
      <div style={{ width: "100%", height: chartH }}>
        <EChart
          key={locale}
          option={option}
          style={{ height: "100%", width: "100%" }}
          notMerge
        />
      </div>
      {showLegend && !compact && viewMode === "rates" && (
        <div className="flex items-center justify-center gap-1 mt-2 px-1 flex-wrap">
          <span
            className="text-[10px] font-medium mr-1"
            style={{ color: mutedColor }}
          >
            {tRetention}:
          </span>
          {LEGEND_ITEMS.map((item) => (
            <div
              key={item.range}
              className="px-1.5 py-0.5 rounded text-[9px] font-semibold"
              style={{
                backgroundColor: isDark ? item.darkBg : item.lightBg,
                color: isDark ? item.darkText : item.lightText,
              }}
            >
              {item.range}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AccountRetentionHeatmap;
