import React, { useMemo } from "react";
import EChart from "@/components/ui/EChart";
import type { ECharts } from "echarts";
import { useTheme } from "@/contexts/ThemeContext";
import { useI18n } from "@/i18n/i18n";
import Hive from "@/types/Hive";
import {
  CustomJsonMetric,
  OTHER_COLOR,
  getCategoryColor,
  metricValue,
  formatMetricValue,
  rowLabelFor,
} from "./networkCustomJsonUtils";

interface Props {
  apps: Hive.NetworkTopCustomJsonRow[];
  metric: CustomJsonMetric;
  // Network total for the metric; the remainder beyond the shown apps is "Others".
  total?: number;
  limit?: number;
}

const NetworkDappUsageTreemap: React.FC<Props> = ({
  apps,
  metric,
  total,
  limit = 10,
}) => {
  const { theme } = useTheme();
  const { t, locale, dir } = useI18n();
  const isDark = theme === "dark";
  const isRTL = dir === "rtl";

  const option = useMemo(() => {
    const shown = apps
      .map((a) => ({
        name: rowLabelFor(a, "app"),
        value: metricValue(a, metric),
        category: a.category,
        itemStyle: { color: getCategoryColor(a.category, isDark) },
      }))
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, limit);

    const shownSum = shown.reduce((s, d) => s + d.value, 0);
    const grandTotal = total && total > shownSum ? total : shownSum;
    const othersValue = Math.max(0, grandTotal - shownSum);
    const pctOf = (v: number) => (grandTotal > 0 ? (v / grandTotal) * 100 : 0);

    const data =
      othersValue > 0
        ? [
            ...shown,
            {
              name: t("networkDappUsage.others"),
              value: othersValue,
              category: t("networkDappUsage.othersHint"),
              itemStyle: {
                color: isDark ? OTHER_COLOR.dark : OTHER_COLOR.light,
              },
            },
          ]
        : shown;

    return {
      tooltip: {
        confine: true,
        backgroundColor: isDark ? "#1f2937" : "#ffffff",
        borderColor: isDark ? "#374151" : "#e5e7eb",
        textStyle: { color: isDark ? "#e5e7eb" : "#374151", fontSize: 11 },
        formatter: (info: {
          name: string;
          value: number;
          data: { category: string };
        }) => `
          <div style="line-height:1.5;direction:${isRTL ? "rtl" : "ltr"};text-align:${isRTL ? "right" : "left"}">
            <div style="font-weight:700;font-size:12px">${info.name}</div>
            <div style="font-size:10px;opacity:.7">${info.data.category}</div>
            <div style="font-size:11px">${formatMetricValue(info.value, metric, locale)} · ${pctOf(
              info.value
            ).toLocaleString(locale, { maximumFractionDigits: 1 })}%</div>
          </div>`,
      },
      series: [
        {
          type: "treemap",
          roam: false,
          nodeClick: false,
          breadcrumb: { show: false },
          width: "100%",
          height: "100%",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          label: {
            show: true,
            color: "#ffffff",
            fontSize: 11,
            overflow: "truncate",
            formatter: (p: { name: string; value: number }) =>
              `${p.name}\n${pctOf(p.value).toLocaleString(locale, {
                maximumFractionDigits: 1,
              })}%`,
          },
          itemStyle: {
            borderColor: isDark ? "#0f172a" : "#ffffff",
            borderWidth: 2,
            gapWidth: 2,
          },
          data,
        },
      ],
    };
  }, [apps, metric, isDark, isRTL, locale, limit, total, t]);

  return (
    <EChart
      option={option}
      onChartReady={(inst: ECharts) => inst.resize()}
      style={{ height: "100%", width: "100%" }}
      notMerge
    />
  );
};

export default NetworkDappUsageTreemap;
