import React, { useMemo } from "react";
import EChart from "@/components/ui/EChart";

export interface TopAccountsChartItem {
  account: string;
  value: number;
}

interface Props {
  data: TopAccountsChartItem[];
  // "HP" | "VESTS" | "HIVE" | "" (empty for plain counts)
  unitLabel: string;
  isDark: boolean;
  textColor: string;
  gridColor: string;
  locale: string;
}

const fmtCompact = (v: number, locale: string) =>
  v.toLocaleString(locale, {
    notation: v >= 100_000 ? "compact" : "standard",
    maximumFractionDigits: v >= 100_000 ? 2 : 0,
  });

const NetworkTopAccountsChart: React.FC<Props> = ({
  data,
  unitLabel,
  isDark,
  textColor,
  gridColor,
  locale,
}) => {
  const option = useMemo(() => {
    // ECharts category axis renders the first item at the bottom; reverse so
    // rank 1 sits at the top of the chart.
    const reversed = [...data].reverse();
    const withUnit = (v: number) =>
      `${fmtCompact(v, locale)}${unitLabel ? " " + unitLabel : ""}`;

    return {
      tooltip: {
        trigger: "item",
        backgroundColor: isDark ? "#1f2937" : "#ffffff",
        borderColor: isDark ? "#374151" : "#e5e7eb",
        textStyle: { color: textColor, fontSize: 11 },
        formatter: (p: { dataIndex: number }) => {
          const d = reversed[p.dataIndex];
          if (!d) return "";
          return `<div style="font-weight:700;font-size:12px">${d.account}</div><div style="font-size:11px">${withUnit(
            d.value
          )}</div>`;
        },
      },
      grid: { left: 4, right: 64, top: 4, bottom: 4, containLabel: true },
      xAxis: {
        type: "value",
        splitLine: {
          show: true,
          lineStyle: { color: gridColor, type: "dashed", width: 1 },
        },
        axisLabel: { show: false },
        axisLine: { show: false },
        axisTick: { show: false },
      },
      yAxis: {
        type: "category",
        data: reversed.map((d) => d.account),
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { color: textColor, fontSize: 10, fontWeight: 500 },
      },
      series: [
        {
          type: "bar",
          barMaxWidth: 16,
          minBarLength: 3,
          data: reversed.map((d) => d.value),
          itemStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [
                { offset: 0, color: "#6366f1" },
                { offset: 1, color: "#3b82f6" },
              ],
            },
            borderRadius: [0, 4, 4, 0],
          },
          label: {
            show: true,
            position: "right",
            color: textColor,
            fontSize: 10,
            fontWeight: "bold",
            formatter: (p: { value: number }) => withUnit(p.value),
          },
          emphasis: {
            itemStyle: { shadowBlur: 8, shadowColor: "rgba(0,0,0,0.3)" },
          },
        },
      ],
    };
  }, [data, unitLabel, isDark, textColor, gridColor, locale]);

  return (
    <EChart
      option={option}
      style={{ height: "100%", width: "100%" }}
      notMerge
    />
  );
};

export default NetworkTopAccountsChart;
