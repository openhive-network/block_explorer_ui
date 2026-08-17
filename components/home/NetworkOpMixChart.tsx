import React, { useMemo, useCallback } from "react";
import EChart from "@/components/ui/EChart";
import moment from "moment";
import { useTheme } from "@/contexts/ThemeContext";
import { useI18n } from "@/i18n/i18n";
import { ProcessedOpMixPoint } from "./NetworkOpMixCard";
import { getOpHexColor } from "@/utils/operationColors";
import { formatCompact, formatLocalePercent } from "@/utils/chartUtils";
import { getOperationTypeForDisplay } from "@/utils/UI";

interface NetworkOpMixChartProps {
  points: ProcessedOpMixPoint[];
  topOps: string[];
  chartType: "bar" | "area";
  includeBrush?: boolean;
  showYear?: boolean;
  dateFormat?: string;
  normalized?: boolean;
  onBarClick?: (dataIndex: number) => void;
}

const NetworkOpMixChart: React.FC<NetworkOpMixChartProps> = ({
  points,
  topOps,
  chartType,
  includeBrush = false,
  showYear = false,
  dateFormat,
  normalized = false,
  onBarClick,
}) => {
  const { theme } = useTheme();
  const { locale, dir } = useI18n();
  const isRTL = dir === "rtl";

  const chartPoints = useMemo(() => {
    if (!normalized) return points;
    return points.map((p) => {
      const periodTotal =
        topOps.reduce((s, op) => s + ((p[op] as number) ?? 0), 0) || 1;
      const np: ProcessedOpMixPoint = {
        date: p.date,
        total_transactions: p.total_transactions,
        total_operations: p.total_operations,
      };
      for (const op of topOps) {
        np[op] = (((p[op] as number) ?? 0) / periodTotal) * 100;
      }
      return np;
    });
  }, [points, topOps, normalized]);

  const option = useMemo(() => {
    const isDark = theme === "dark";
    const labelColor = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";
    const gridColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
    const tooltipBg = isDark ? "#1e2533" : "#ffffff";
    const tooltipBorder = isDark ? "#2d3748" : "#e5e7eb";
    const tooltipText = isDark ? "#f1f5f9" : "#0f172a";

    const dates = points.map((p) =>
      showYear
        ? moment(p.date).format("YYYY")
        : dateFormat
          ? moment(p.date).format(dateFormat)
          : moment(p.date).format("MMM D")
    );

    const series: any[] = topOps.map((opName) => ({
      name: opName,
      type: chartType === "area" ? "line" : "bar",
      stack: "total",
      ...(chartType === "area"
        ? {
            areaStyle: { opacity: 0.75 },
            lineStyle: { width: 0 },
            symbol: "none",
            emphasis: { focus: "series" },
          }
        : { emphasis: { focus: "series" } }),
      itemStyle: { color: getOpHexColor(opName) },
      data: chartPoints.map((p) => (p[opName] as number) ?? 0),
    }));

    // Ghost bars in area mode — transparent click targets so bar-click events fire
    if (chartType === "area" && onBarClick) {
      series.push({
        name: "__clickTarget",
        type: "bar",
        barMaxWidth: "100%",
        itemStyle: { color: "transparent", borderColor: "transparent" },
        emphasis: { itemStyle: { color: "transparent" } },
        silent: false,
        z: 10,
        data: chartPoints.map(
          (p) => topOps.reduce((s, op) => s + ((p[op] as number) ?? 0), 0) || 1
        ),
      });
    }

    const manyOps = topOps.length > 12;
    const legendHeight = manyOps ? 40 : Math.ceil(topOps.length / 5) * 20 + 8;
    const gridBottom = (includeBrush ? 74 : 12) + legendHeight + 8;
    const legendBottom = includeBrush ? 74 : 8;

    return {
      animation: true,
      grid: {
        left: isRTL ? 20 : 55,
        right: isRTL ? 55 : 20,
        top: 16,
        bottom: gridBottom,
        containLabel: false,
      },
      legend: {
        show: true,
        left: "center",
        bottom: legendBottom,
        type: manyOps ? ("scroll" as const) : ("plain" as const),
        orient: "horizontal" as const,
        data: topOps,
        textStyle: { color: labelColor, fontSize: 11 },
        icon: "circle",
        itemWidth: 8,
        itemHeight: 8,
        itemGap: 12,
        ...(manyOps
          ? {
              pageIconColor: labelColor,
              pageTextStyle: { color: labelColor, fontSize: 10 },
            }
          : {}),
        formatter: (name: string) =>
          name === "Other" ? name : getOperationTypeForDisplay(name),
      },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        appendToBody: true,
        backgroundColor: tooltipBg,
        borderColor: tooltipBorder,
        borderWidth: 1,
        padding: [10, 14],
        textStyle: { color: tooltipText, fontSize: 12 },
        formatter: (params: any[]) => {
          if (!params?.length) return "";
          const date = params[0].axisValue as string;
          const rows = [...params]
            .reverse()
            .filter(
              (p) => (p.value ?? 0) > 0 && p.seriesName !== "__clickTarget"
            )
            .map((p) => {
              const label =
                p.seriesName === "Other"
                  ? "Other"
                  : getOperationTypeForDisplay(p.seriesName);
              const valueStr = normalized
                ? formatLocalePercent(p.value as number, locale)
                : formatCompact(p.value, locale);
              return `<div style="display:flex;align-items:center;gap:6px;margin-top:4px">
                  <span style="flex-shrink:0;width:8px;height:8px;border-radius:50%;background:${p.color}"></span>
                  <span style="opacity:.7;font-size:11px">${label}:</span>
                  <b>${valueStr}</b>
                </div>`;
            })
            .join("");
          return `<div style="min-width:160px;direction:${isRTL ? "rtl" : "ltr"}"><div style="font-weight:700;margin-bottom:6px">${date}</div>${rows}</div>`;
        },
      },
      xAxis: {
        type: "category",
        data: dates,
        inverse: isRTL,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: labelColor,
          fontSize: 10,
          interval: points.length > 20 ? Math.floor(points.length / 8) : 0,
          hideOverlap: true,
        },
        splitLine: { show: false },
      },
      yAxis: {
        type: "value",
        max: normalized ? 100 : undefined,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: labelColor,
          fontSize: 10,
          formatter: (v: number) =>
            normalized ? `${v}%` : formatCompact(v, locale),
        },
        splitLine: {
          lineStyle: { color: gridColor, type: "dashed" as const },
        },
        position: isRTL ? "right" : "left",
      },
      ...(includeBrush
        ? {
            dataZoom: [
              {
                type: "slider",
                bottom: 12,
                height: 28,
                borderColor: tooltipBorder,
                fillerColor: isDark
                  ? "rgba(99,102,241,0.15)"
                  : "rgba(99,102,241,0.1)",
                handleStyle: { color: "#6366f1" },
                textStyle: { color: labelColor, fontSize: 10 },
              },
            ],
          }
        : {}),
      series,
    };
  }, [
    chartPoints,
    topOps,
    chartType,
    theme,
    locale,
    isRTL,
    includeBrush,
    showYear,
    dateFormat,
    normalized,
    points,
    onBarClick,
  ]);

  const onEvents = useMemo(
    () =>
      onBarClick
        ? {
            click: (params: any) => {
              if (params.dataIndex !== undefined)
                onBarClick(params.dataIndex as number);
            },
          }
        : undefined,
    [onBarClick]
  );

  return (
    <EChart
      option={option}
      style={{ width: "100%", height: "100%" }}
      notMerge={true}
      onEvents={onEvents}
    />
  );
};

export default NetworkOpMixChart;
