import React, { useMemo } from "react";
import EChart from "@/components/ui/EChart";
import type { ECharts } from "echarts";
import { useTheme } from "@/contexts/ThemeContext";
import { useI18n } from "@/i18n/i18n";
import Hive from "@/types/Hive";
import {
  FootprintMetric,
  getCategoryColor,
  metricValue,
  metricPct,
  formatMetricValue,
} from "./rcFootprintUtils";

interface RcFootprintCategoryDonutProps {
  categories: Hive.AccountDappFootprintCategory[];
  metric: FootprintMetric;
  selectedCategory: string | null;
  onSelectCategory: (category: string) => void;
}

const RcFootprintCategoryDonut: React.FC<RcFootprintCategoryDonutProps> = ({
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

  const option = useMemo(() => {
    // Fully controlled selection: the active slice stays fully opaque while the
    // rest dim. No ECharts selectedMode (its internal toggle desyncs from React
    // state when the active slice is re-clicked) and no heavy highlight border.
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
          const pct = cat ? metricPct(cat, metric) : info.percent;
          return `
          <div style="line-height:1.5;direction:${isRTL ? "rtl" : "ltr"};text-align:${isRTL ? "right" : "left"}">
            <div style="font-weight:700;font-size:12px;margin-bottom:2px">${info.name}</div>
            <div style="font-size:11px">${formatMetricValue(info.value, metric, locale)}${metric === "rc" ? " RC" : " " + t("rcFootprint.ops")}</div>
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
              const pct = cat ? metricPct(cat, metric) : info.percent;
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
    t,
  ]);

  const onEvents = useMemo(
    () => ({
      click: (params: { name?: string; data?: unknown }) => {
        if (params?.name) onSelectCategory(params.name);
      },
    }),
    [onSelectCategory]
  );

  return (
    <EChart
      option={option}
      onEvents={onEvents}
      // A single resize once the chart is ready fixes any init-timing collapse
      // in a lazily-sized cell. No observer → cannot loop against the scrollbar.
      onChartReady={(inst: ECharts) => inst.resize()}
      style={{ height: "100%", width: "100%" }}
      notMerge
    />
  );
};

export default RcFootprintCategoryDonut;
