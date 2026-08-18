import React, { useMemo } from "react";
import EChart from "@/components/ui/EChart";
import { useTheme } from "@/contexts/ThemeContext";
import { useI18n } from "../../i18n/i18n";
import Hive from "@/types/Hive";
import { aggregateRcByOp, formatRc, formatOpLabel } from "./networkRcUtils";
import { getOpHexColor, getContrastText } from "@/utils/operationColors";

interface NetworkRcUtilizationTreemapProps {
  data: Hive.NetworkRcUtilizationResponse[] | undefined;
  includeClaims: boolean;
  topN?: number;
}

const NetworkRcUtilizationTreemap: React.FC<
  NetworkRcUtilizationTreemapProps
> = ({ data, includeClaims, topN = 16 }) => {
  const { theme } = useTheme();
  const { t, dir, locale } = useI18n();
  const isDark = theme === "dark";
  const isRTL = dir === "rtl";
  const textColor = isDark ? "#e5e7eb" : "#374151";
  const mutedColor = isDark ? "#9ca3af" : "#6b7280";

  const option = useMemo(() => {
    const { ops, total } = aggregateRcByOp(data ?? [], includeClaims);
    const top = ops.slice(0, topN);
    const otherValue = ops.slice(topN).reduce((s, o) => s + o.value, 0);

    const makeNode = (name: string, value: number, op: string) => {
      const color = getOpHexColor(op);
      const labelColor = getContrastText(color);
      return {
        name,
        value,
        itemStyle: { color },
        label: { color: labelColor },
      };
    };
    const nodes = top.map((o) => makeNode(formatOpLabel(o.op), o.value, o.op));
    if (otherValue > 0)
      nodes.push(
        makeNode(t("networkRcUtilizationCard.other"), otherValue, "Other")
      );

    const pctOf = (v: number) => (total > 0 ? (v / total) * 100 : 0);

    return {
      tooltip: {
        confine: true,
        formatter: (info: { name: string; value: number }) => `
          <div style="line-height:1.5;direction:${isRTL ? "rtl" : "ltr"};text-align:${isRTL ? "right" : "left"}">
            <div style="font-weight:700;font-size:12px;margin-bottom:2px">${info.name}</div>
            <div style="font-size:11px">${formatRc(info.value, locale)} RC</div>
            <div style="font-size:10px;color:${mutedColor}">${pctOf(info.value).toLocaleString(locale, { maximumFractionDigits: 2 })}%</div>
          </div>`,
        backgroundColor: isDark ? "#1f2937" : "#ffffff",
        borderColor: isDark ? "#374151" : "#e5e7eb",
        textStyle: { color: textColor, fontSize: 11 },
      },
      series: [
        {
          type: "treemap",
          roam: false,
          nodeClick: false,
          breadcrumb: { show: false },
          top: 2,
          left: 2,
          right: 2,
          bottom: 2,
          itemStyle: {
            borderColor: isDark ? "#0f172a" : "#ffffff",
            borderWidth: 2,
            gapWidth: 2,
          },
          label: {
            show: true,
            fontSize: 11,
            lineHeight: 14,
            overflow: "truncate",
            formatter: (info: { name: string; value: number }) =>
              `${info.name}\n${pctOf(info.value).toLocaleString(locale, {
                maximumFractionDigits: 1,
              })}%`,
          },
          emphasis: {
            itemStyle: { shadowBlur: 8, shadowColor: "rgba(0,0,0,0.3)" },
          },
          data: nodes,
        },
      ],
    };
  }, [
    data,
    includeClaims,
    topN,
    isDark,
    isRTL,
    textColor,
    mutedColor,
    locale,
    t,
  ]);

  return (
    <EChart
      option={option}
      style={{ height: "100%", width: "100%" }}
      notMerge
    />
  );
};

export default NetworkRcUtilizationTreemap;
