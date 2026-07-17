import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import type { ECharts } from "echarts";
import { useTheme } from "@/contexts/ThemeContext";
import { useI18n } from "@/i18n/i18n";
import Hive from "@/types/Hive";
import {
  DappMetric,
  getCategoryColor,
  metricValue,
  metricShare,
  formatMetricValue,
} from "./networkDappUsageUtils";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

interface NetworkDappUsageDonutProps {
  categories: Hive.NetworkDappFootprintCategory[];
  metric: DappMetric;
  selectedCategory: string | null;
  onSelectCategory: (category: string) => void;
}

const NetworkDappUsageDonut: React.FC<NetworkDappUsageDonutProps> = ({
  categories,
  metric,
  selectedCategory,
  onSelectCategory,
}) => {
  const { theme } = useTheme();
  const { t, dir, locale } = useI18n();
  const isDark = theme === "dark";
  const isRTL = dir === "rtl";
  const textColor = isDark ? "#e5e7eb" : "#374151";
  const mutedColor = isDark ? "#9ca3af" : "#6b7280";

  const unitLabel =
    metric === "rc"
      ? " RC"
      : metric === "users"
        ? " " + t("networkDappUsage.usersUnit")
        : " " + t("networkDappUsage.opsUnit");

  const option = useMemo(() => {
    const total = categories.reduce((s, c) => s + metricValue(c, metric), 0);
    // Fully controlled selection: the active slice stays opaque while the rest
    // dim. No ECharts selectedMode (its internal toggle desyncs from React).
    const data = categories.map((c) => {
      const isSelected = c.category === selectedCategory;
      return {
        name: c.category,
        value: metricValue(c, metric),
        itemStyle: {
          color: getCategoryColor(c.category, isDark),
          borderColor: isDark ? "#0f172a" : "#ffffff",
          borderWidth: 2,
          opacity: selectedCategory && !isSelected ? 0.5 : 1,
        },
      };
    });

    return {
      tooltip: {
        trigger: "item",
        confine: true,
        backgroundColor: isDark ? "#1f2937" : "#ffffff",
        borderColor: isDark ? "#374151" : "#e5e7eb",
        textStyle: { color: textColor, fontSize: 11 },
        formatter: (info: { name: string; value: number; percent: number }) => {
          const cat = categories.find((c) => c.category === info.name);
          const pct = cat ? metricShare(cat, metric, total) : info.percent;
          return `
          <div style="line-height:1.5;direction:${isRTL ? "rtl" : "ltr"};text-align:${isRTL ? "right" : "left"}">
            <div style="font-weight:700;font-size:12px;margin-bottom:2px">${info.name}</div>
            <div style="font-size:11px">${formatMetricValue(info.value, metric, locale)}${unitLabel}</div>
            <div style="font-size:10px;color:${mutedColor}">${pct.toLocaleString(locale, { maximumFractionDigits: 2 })}%</div>
          </div>`;
        },
      },
      series: [
        {
          type: "pie",
          radius: ["45%", "72%"],
          center: ["50%", "50%"],
          avoidLabelOverlap: true,
          label: {
            show: true,
            color: textColor,
            fontSize: 11,
            formatter: (info: { name: string; percent: number }) => {
              const cat = categories.find((c) => c.category === info.name);
              const pct = cat ? metricShare(cat, metric, total) : info.percent;
              return `${info.name}\n${pct.toLocaleString(locale, {
                maximumFractionDigits: 1,
              })}%`;
            },
          },
          labelLine: { length: 8, length2: 8 },
          emphasis: {
            itemStyle: { shadowBlur: 10, shadowColor: "rgba(0,0,0,0.3)" },
            label: { fontWeight: 700 },
          },
          data,
        },
      ],
    };
  }, [
    categories,
    metric,
    selectedCategory,
    isDark,
    isRTL,
    textColor,
    mutedColor,
    locale,
    unitLabel,
  ]);

  const onEvents = useMemo(
    () => ({
      click: (params: { name?: string }) => {
        if (params?.name) onSelectCategory(params.name);
      },
    }),
    [onSelectCategory]
  );

  return (
    <ReactECharts
      option={option}
      onEvents={onEvents}
      // A single resize once ready fixes any init-timing collapse in a lazily
      // sized cell. No observer → cannot loop against the scrollbar.
      onChartReady={(inst: ECharts) => inst.resize()}
      style={{ height: "100%", width: "100%" }}
      notMerge
    />
  );
};

export default NetworkDappUsageDonut;
