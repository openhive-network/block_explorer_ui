import React, { useMemo } from "react";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useI18n } from "@/i18n/i18n";
import { useTheme } from "@/contexts/ThemeContext";
import useNetworkHpDistribution from "@/hooks/api/homePage/useNetworkHpDistribution";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

const BAR_COLOR = "#6366f1";

const NetworkHpDistributionCard: React.FC = () => {
  const { t, locale } = useI18n();
  const { theme } = useTheme();
  const { hpDistribution, isHpDistributionLoading, isHpDistributionError } =
    useNetworkHpDistribution();

  const textColor = theme === "dark" ? "#e5e7eb" : "#374151";
  const axisColor = theme === "dark" ? "#6b7280" : "#9ca3af";

  const option = useMemo(() => {
    if (!hpDistribution || hpDistribution.length === 0) return null;

    const accountsLabel = t("networkHpDistributionCard.accounts");
    const shareLabel = t("networkHpDistributionCard.share");

    // Reverse so the smallest bracket (1M+ HP) appears at top of chart
    const reversed = [...hpDistribution].reverse();

    const tooltipHtml = reversed.map((d) => {
      const count = d.account_count.toLocaleString(locale);
      const pct =
        d.pct_accounts < 0.005
          ? "<0.01"
          : d.pct_accounts.toLocaleString(locale, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });
      return `<b>${d.bucket}</b><br/>${accountsLabel}: ${count}<br/>${shareLabel}: ${pct}%`;
    });

    const labelText = reversed.map((d) => {
      if (d.pct_accounts < 0.005) return "<0.01%";
      return `${d.pct_accounts.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
    });

    return {
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        formatter: (params: any[]) => tooltipHtml[params[0].dataIndex],
        backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
        borderColor: theme === "dark" ? "#374151" : "#e5e7eb",
        textStyle: { color: textColor, fontSize: 11 },
      },
      grid: { left: 80, right: 60, top: 8, bottom: 8, containLabel: false },
      xAxis: {
        type: "log",
        logBase: 10,
        min: 1,
        axisLine: { lineStyle: { color: axisColor } },
        axisLabel: {
          color: axisColor,
          fontSize: 9,
          formatter: (v: number) => {
            if (v >= 1_000_000) return `${v / 1_000_000}M`;
            if (v >= 1_000) return `${v / 1_000}K`;
            return String(v);
          },
        },
        splitLine: {
          lineStyle: { color: theme === "dark" ? "#374151" : "#f3f4f6" },
        },
      },
      yAxis: {
        type: "category",
        data: reversed.map((d) => d.bucket),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: textColor, fontSize: 10 },
      },
      series: [
        {
          type: "bar",
          data: reversed.map((d, i) => ({
            value: d.account_count,
            label: { formatter: () => labelText[i] },
          })),
          itemStyle: { color: BAR_COLOR, borderRadius: [0, 3, 3, 0] },
          label: {
            show: true,
            position: "right",
            color: textColor,
            fontSize: 9,
          },
        },
      ],
    };
  }, [hpDistribution, theme, textColor, axisColor, locale, t]);

  return (
    <div className="bg-theme rounded mb-2 shadow-md overflow-hidden h-full">
      <div className="p-3 h-full flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-explorer-dark-gray dark:text-text">
            {t("networkHpDistributionCard.title")}
          </span>
        </div>

        {isHpDistributionLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="animate-spin h-5 w-5" />
          </div>
        ) : isHpDistributionError || !option ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-red-500 text-xs">
              {t("common.errorLoadingData")}
            </p>
          </div>
        ) : (
          <div className="flex-1 min-h-[200px]">
            <ReactECharts
              option={option}
              style={{ height: "100%", width: "100%" }}
              notMerge
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default NetworkHpDistributionCard;
