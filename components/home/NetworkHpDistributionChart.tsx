import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import Hive from "@/types/Hive";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

const BAR_GRADIENT: [string, string][] = [
  ["#8b5cf6", "#a78bfa"],
  ["#3b82f6", "#60a5fa"],
  ["#06b6d4", "#22d3ee"],
  ["#22c55e", "#4ade80"],
  ["#eab308", "#facc15"],
  ["#f97316", "#fb923c"],
  ["#ef4444", "#f87171"],
  ["#ec4899", "#f472b6"],
];

interface Props {
  hpDistribution: Hive.NetworkHpDistributionResponse[];
  viewMode: "accounts" | "hp";
  userBucket: string | null;
  isDark: boolean;
  textColor: string;
  gridColor: string;
  locale: string;
  t: (key: string) => string;
}

const NetworkHpDistributionChart: React.FC<Props> = ({
  hpDistribution,
  viewMode,
  userBucket,
  isDark,
  textColor,
  gridColor,
  locale,
  t,
}) => {
  const option = useMemo(() => {
    const reversed = [...hpDistribution].reverse();

    const fmtPct = (v: number) =>
      v < 0.005
        ? "<0.01"
        : v.toLocaleString(locale, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });

    const fmtHp = (hp: number) => {
      if (hp >= 1_000_000)
        return `${(hp / 1_000_000).toLocaleString(locale, { maximumFractionDigits: 1 })}M`;
      if (hp >= 1_000)
        return `${(hp / 1_000).toLocaleString(locale, { maximumFractionDigits: 1 })}K`;
      return hp.toLocaleString(locale, { maximumFractionDigits: 0 });
    };

    return {
      tooltip: {
        trigger: "item",
        formatter: (params: { dataIndex: number }) => {
          const d = reversed[params.dataIndex];
          if (!d) return "";
          const mutedColor = isDark ? "#9ca3af" : "#6b7280";
          const count = d.account_count.toLocaleString(locale);
          const pctHp = fmtPct(d.pct_hp);
          const pctAccounts = fmtPct(d.pct_accounts);
          const hpHeld = t("networkHpDistributionCard.hpHeld");
          const share = t("networkHpDistributionCard.share");
          const hp = fmtHp(d.total_hp);
          const primary =
            viewMode === "accounts"
              ? t("networkHpDistributionCard.tooltipPrimaryAccounts", {
                  pct: pctAccounts,
                  bucket: d.bucket,
                })
              : t("networkHpDistributionCard.tooltipPrimaryHp", {
                  count,
                  pct: pctHp,
                });
          const secondary =
            viewMode === "accounts"
              ? t("networkHpDistributionCard.tooltipSecondaryAccounts", {
                  count,
                  hp,
                  hpHeld,
                  share,
                  pct: pctHp,
                })
              : t("networkHpDistributionCard.tooltipSecondaryHp", {
                  share,
                  pct: pctAccounts,
                  hp,
                  hpHeld,
                });
          return `
            <div style="max-width:240px;line-height:1.5;white-space:normal;word-break:break-word">
              <div style="font-weight:700;font-size:12px;margin-bottom:4px">${d.bucket}</div>
              <div style="font-size:11px">${primary}</div>
              <div style="font-size:10px;color:${mutedColor};margin-top:2px">${secondary}</div>
            </div>`;
        },
        // confine:true is ignored when a custom position fn is provided — handle manually.
        position: (
          point: number[],
          _p: unknown,
          _dom: unknown,
          _rect: unknown,
          size: { contentSize: number[]; viewSize: number[] }
        ) => {
          const [tw, th] = size.contentSize;
          const [cw, ch] = size.viewSize;
          const x =
            point[0] + 14 + tw > cw
              ? Math.max(0, point[0] - tw - 14)
              : point[0] + 14;
          const y = Math.min(
            Math.max(0, point[1] - th / 2),
            Math.max(0, ch - th)
          );
          return [x, y];
        },
        backgroundColor: isDark ? "#1f2937" : "#ffffff",
        borderColor: isDark ? "#374151" : "#e5e7eb",
        textStyle: { color: textColor, fontSize: 11 },
      },
      grid: { left: 4, right: 52, top: 4, bottom: 4, containLabel: true },
      xAxis: {
        type: "value",
        show: true,
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
        data: reversed.map((d) => d.bucket),
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { color: textColor, fontSize: 10, fontWeight: 500 },
      },
      series: [
        {
          type: "bar",
          barMaxWidth: 14,
          minBarLength: 4,
          data: reversed.map((d, i) => {
            const idx = hpDistribution.length - 1 - i;
            const [colorStart, colorEnd] =
              BAR_GRADIENT[idx % BAR_GRADIENT.length];
            const isUser = userBucket === d.bucket;
            const rawPct = viewMode === "accounts" ? d.pct_accounts : d.pct_hp;
            const pct = `${fmtPct(rawPct)}%`;
            return {
              value: Math.sqrt(rawPct),
              itemStyle: {
                color: {
                  type: "linear",
                  x: 0,
                  y: 0,
                  x2: 1,
                  y2: 0,
                  colorStops: [
                    { offset: 0, color: colorStart },
                    { offset: 1, color: colorEnd },
                  ],
                },
                borderRadius: [0, 4, 4, 0],
              },
              label: {
                formatter: () =>
                  isUser
                    ? `${pct}  {you|${t("networkHpDistributionCard.you")}}`
                    : pct,
              },
            };
          }),
          label: {
            show: true,
            position: "right",
            color: textColor,
            fontSize: 10,
            fontWeight: "bold",
            rich: {
              you: {
                backgroundColor: isDark ? "#1e1b4b" : "#ede9fe",
                color: isDark ? "#c4b5fd" : "#6d28d9",
                borderRadius: 4,
                borderWidth: 1,
                borderColor: isDark ? "#4c1d95" : "#c4b5fd",
                padding: [2, 5],
                fontSize: 8,
                fontWeight: "bold",
              },
            },
          },
          emphasis: {
            itemStyle: { shadowBlur: 8, shadowColor: "rgba(0,0,0,0.3)" },
          },
        },
      ],
    };
  }, [
    hpDistribution,
    viewMode,
    userBucket,
    isDark,
    textColor,
    gridColor,
    locale,
    t,
  ]);

  return (
    <ReactECharts
      option={option}
      style={{ height: "100%", width: "100%" }}
      notMerge
    />
  );
};

export default NetworkHpDistributionChart;
