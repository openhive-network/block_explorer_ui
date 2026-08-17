import React, { useMemo } from "react";
import EChart from "@/components/ui/EChart";
import moment from "moment";
import type { ECharts } from "echarts";
import { useTheme } from "@/contexts/ThemeContext";
import { useI18n } from "@/i18n/i18n";
import Hive from "@/types/Hive";
import {
  CustomJsonMetric,
  metricValue,
  formatMetricValue,
} from "./networkCustomJsonUtils";

const COLOR = "#6366f1";
const BRUSH_THRESHOLD = 40;

interface Props {
  rows: Hive.NetworkCustomJsonUsageRow[];
  metric: CustomJsonMetric;
  granularity?: "day" | "week" | "month";
}

const NetworkDappUsageTrendChart: React.FC<Props> = ({
  rows,
  metric,
  granularity = "day",
}) => {
  const { theme } = useTheme();
  const { locale, dir } = useI18n();
  const isDark = theme === "dark";
  const isRTL = dir === "rtl";
  const textColor = isDark ? "#9ca3af" : "#6b7280";
  const gridColor = isDark ? "#374151" : "#e5e7eb";

  const option = useMemo(() => {
    const fmtDate = (period: string) => {
      const m = moment(period).locale(locale);
      if (!m.isValid()) return period;
      return granularity === "month" ? m.format("MMM YYYY") : m.format("MMM D");
    };

    const hasBrush = rows.length > BRUSH_THRESHOLD;
    const values = rows.map((r) => metricValue(r, metric));
    const maxV = values.length ? Math.max(...values) : 0;
    // Clean rounded axis top with headroom so the peak chip isn't clipped.
    const niceMax = (v: number): number | undefined => {
      if (v <= 0) return undefined;
      const target = v * 1.15;
      const pow = Math.pow(10, Math.floor(Math.log10(target)) - 1);
      return Math.ceil(target / pow) * pow;
    };

    return {
      grid: {
        left: 8,
        right: 16,
        top: 34,
        bottom: hasBrush ? 48 : 24,
        containLabel: true,
      },
      tooltip: {
        trigger: "axis",
        confine: true,
        backgroundColor: isDark ? "#1f2937" : "#ffffff",
        borderColor: gridColor,
        textStyle: { color: textColor, fontSize: 11 },
        formatter: (params: { axisValue: string; data: number }[]) => {
          const p = params[0];
          return `<div style="direction:${isRTL ? "rtl" : "ltr"}"><b>${fmtDate(
            p.axisValue
          )}</b><br/>${formatMetricValue(p.data, metric, locale)}</div>`;
        },
      },
      xAxis: {
        type: "category",
        data: rows.map((r) => r.period),
        axisLabel: {
          color: textColor,
          fontSize: 10,
          formatter: (v: string) => fmtDate(v),
        },
        axisLine: { lineStyle: { color: gridColor } },
      },
      yAxis: {
        type: "value",
        max: niceMax(maxV),
        axisLabel: {
          color: textColor,
          fontSize: 10,
          formatter: (v: number) => formatMetricValue(v, metric, locale),
        },
        splitLine: { lineStyle: { color: gridColor } },
      },
      dataZoom: hasBrush
        ? [
            { type: "inside" },
            {
              type: "slider",
              height: 16,
              bottom: 8,
              borderColor: gridColor,
              textStyle: { color: textColor, fontSize: 9 },
            },
          ]
        : [],
      series: [
        {
          type: "line",
          data: rows.map((r) => metricValue(r, metric)),
          smooth: true,
          symbol: "none",
          lineStyle: { color: COLOR, width: 2 },
          areaStyle: { color: COLOR, opacity: 0.12 },
          markPoint: {
            symbol: "circle",
            symbolSize: 7,
            itemStyle: { color: COLOR },
            label: {
              show: true,
              position: "top",
              distance: 8,
              color: "#ffffff",
              backgroundColor: COLOR,
              padding: [3, 7],
              borderRadius: 5,
              fontSize: 11,
              fontWeight: 600,
              formatter: (p: { value: number }) =>
                formatMetricValue(p.value, metric, locale),
            },
            data: [{ type: "max" }],
          },
        },
      ],
    };
  }, [rows, metric, granularity, isDark, isRTL, textColor, gridColor, locale]);

  return (
    <EChart
      option={option}
      onChartReady={(inst: ECharts) => inst.resize()}
      style={{ height: "100%", width: "100%" }}
      notMerge
    />
  );
};

export default NetworkDappUsageTrendChart;
