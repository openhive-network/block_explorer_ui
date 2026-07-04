import React, { useMemo } from "react";
import moment from "moment";
import dynamic from "next/dynamic";
import Hive from "@/types/Hive";
import { useI18n } from "@/i18n/i18n";
import { useTheme } from "@/contexts/ThemeContext";
import { formatCompact } from "@/utils/chartUtils";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

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
  if (pct < 0) return isDark ? "#1f2937" : "#f3f4f6";
  if (pct < 10) return isDark ? "#7f1d1d" : "#fee2e2";
  if (pct < 30) return isDark ? "#78350f" : "#fef3c7";
  if (pct < 50) return isDark ? "#064e3b" : "#d1fae5";
  if (pct < 70) return isDark ? "#065f46" : "#86efac";
  return isDark ? "#166534" : "#34d399";
};
const getPctText = (pct: number, isDark: boolean): string => {
  if (pct < 0) return isDark ? "#4b5563" : "#9ca3af";
  if (pct < 10) return isDark ? "#fca5a5" : "#b91c1c";
  if (pct < 30) return isDark ? "#fcd34d" : "#92400e";
  return isDark ? "#6ee7b7" : "#065f46";
};

const getCountBg = (t: number, isDark: boolean): string => {
  if (t < 0) return isDark ? "#1f2937" : "#f3f4f6";
  if (isDark) {
    if (t < 0.33) return "#2e1065";
    if (t < 0.66) return "#4c1d95";
    return "#5b21b6";
  }
  if (t < 0.33) return "#ede9fe";
  if (t < 0.66) return "#ddd6fe";
  return "#c4b5fd";
};
const getCountText = (t: number, isDark: boolean): string => {
  if (t < 0) return isDark ? "#4b5563" : "#9ca3af";
  if (isDark) return t < 0.5 ? "#c4b5fd" : "#ede9fe";
  return t < 0.5 ? "#5b21b6" : "#2e1065";
};

const getNewBg = (t: number, isDark: boolean): string => {
  if (isDark) {
    if (t < 0.33) return "#1e1b4b";
    if (t < 0.66) return "#3730a3";
    return "#4338ca";
  }
  if (t < 0.33) return "#e0e7ff";
  if (t < 0.66) return "#c7d2fe";
  return "#a5b4fc";
};
const getNewText = (t: number, isDark: boolean): string => {
  if (isDark) return t < 0.5 ? "#a5b4fc" : "#e0e7ff";
  return t < 0.5 ? "#3730a3" : "#1e1b4b";
};

interface AccountRetentionHeatmapProps {
  data: Hive.AccountFunnelResponse[];
  compact?: boolean;
  viewMode?: HeatmapViewMode;
  showLegend?: boolean;
}

const LEGEND_ITEMS = [
  {
    range: "<10%",
    lightBg: "#fee2e2",
    darkBg: "#7f1d1d",
    lightText: "#b91c1c",
    darkText: "#fca5a5",
  },
  {
    range: "10–30%",
    lightBg: "#fef3c7",
    darkBg: "#78350f",
    lightText: "#92400e",
    darkText: "#fcd34d",
  },
  {
    range: "30–50%",
    lightBg: "#d1fae5",
    darkBg: "#064e3b",
    lightText: "#065f46",
    darkText: "#6ee7b7",
  },
  {
    range: "50–70%",
    lightBg: "#86efac",
    darkBg: "#065f46",
    lightText: "#065f46",
    darkText: "#6ee7b7",
  },
  {
    range: "≥70%",
    lightBg: "#34d399",
    darkBg: "#166534",
    lightText: "#065f46",
    darkText: "#6ee7b7",
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
          color: mutedColor,
          fontSize: compact ? 10 : 12,
          fontWeight: "bold",
          margin: compact ? 4 : 6,
          rich: {
            new: {
              color: isDark ? "#818cf8" : "#4338ca",
              fontWeight: "bold",
              fontSize: compact ? 10 : 12,
            },
          },
          formatter: (value: string) =>
            value === tNewAccounts ? `{new|${value}}` : value,
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
            fontWeight: "bold",
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
  ]);

  const rowH = compact ? 22 : 36;
  const chartH = Math.max(compact ? 100 : 240, data.length * rowH + 52);

  return (
    <div style={{ width: "100%" }}>
      <div style={{ width: "100%", height: chartH }}>
        <ReactECharts
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
