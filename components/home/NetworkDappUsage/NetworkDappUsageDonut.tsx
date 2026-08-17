import React, { useMemo } from "react";
import EChart from "@/components/ui/EChart";
import type { ECharts } from "echarts";
import { useI18n } from "@/i18n/i18n";
import { useTheme } from "@/contexts/ThemeContext";
import {
  CustomJsonMetric,
  DonutSlice,
  formatMetricValue,
} from "./networkCustomJsonUtils";

interface Props {
  slices: DonutSlice[];
  metric: CustomJsonMetric;
  selectedName?: string | null;
  onSelectSlice?: (name: string) => void;
  showLabels?: boolean;
}

const NetworkDappUsageDonut: React.FC<Props> = ({
  slices,
  metric,
  selectedName = null,
  onSelectSlice,
  showLabels = false,
}) => {
  const { theme } = useTheme();
  const { dir, locale } = useI18n();
  const isDark = theme === "dark";
  const isRTL = dir === "rtl";
  const textColor = isDark ? "#e5e7eb" : "#374151";
  const mutedColor = isDark ? "#9ca3af" : "#6b7280";

  const option = useMemo(() => {
    const total = slices.reduce((s, c) => s + c.value, 0);
    const data = slices.map((c) => {
      const isSelected = c.name === selectedName;
      return {
        name: c.name,
        value: c.value,
        itemStyle: {
          color: c.color,
          borderColor: isDark ? "#0f172a" : "#ffffff",
          borderWidth: 2,
          opacity: selectedName && !isSelected ? 0.5 : 1,
        },
      };
    });

    const pctOf = (v: number) => (total > 0 ? (v / total) * 100 : 0);

    return {
      title: {
        text: formatMetricValue(total, metric, locale),
        left: "center",
        top: "center",
        textStyle: { fontSize: 18, fontWeight: 700, color: textColor },
      },
      tooltip: {
        trigger: "item",
        confine: true,
        backgroundColor: isDark ? "#1f2937" : "#ffffff",
        borderColor: isDark ? "#374151" : "#e5e7eb",
        textStyle: { color: textColor, fontSize: 11 },
        formatter: (info: { name: string; value: number }) => `
          <div style="line-height:1.5;direction:${isRTL ? "rtl" : "ltr"};text-align:${isRTL ? "right" : "left"}">
            <div style="font-weight:700;font-size:12px;margin-bottom:2px">${info.name}</div>
            <div style="font-size:11px">${formatMetricValue(info.value, metric, locale)}</div>
            <div style="font-size:10px;color:${mutedColor}">${pctOf(info.value).toLocaleString(locale, { maximumFractionDigits: 2 })}%</div>
          </div>`,
      },
      series: [
        {
          type: "pie",
          radius: ["50%", "92%"],
          center: ["50%", "50%"],
          avoidLabelOverlap: true,
          label: {
            show: showLabels,
            color: textColor,
            fontSize: 11,
            formatter: (info: { name: string; value: number }) =>
              `${info.name}\n${pctOf(info.value).toLocaleString(locale, {
                maximumFractionDigits: 1,
              })}%`,
          },
          labelLine: { show: showLabels, length: 8, length2: 8 },
          emphasis: {
            itemStyle: { shadowBlur: 10, shadowColor: "rgba(0,0,0,0.3)" },
            label: { fontWeight: 700 },
          },
          data,
        },
      ],
    };
  }, [
    slices,
    metric,
    selectedName,
    isDark,
    isRTL,
    textColor,
    mutedColor,
    locale,
    showLabels,
  ]);

  const onEvents = useMemo(
    () => ({
      click: (params: { name?: string }) => {
        if (params?.name && onSelectSlice) onSelectSlice(params.name);
      },
    }),
    [onSelectSlice]
  );

  return (
    <EChart
      option={option}
      onEvents={onEvents}
      onChartReady={(inst: ECharts) => inst.resize()}
      style={{ height: "100%", width: "100%" }}
      notMerge
    />
  );
};

export default NetworkDappUsageDonut;
