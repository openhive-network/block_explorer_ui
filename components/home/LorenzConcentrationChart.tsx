import React, { useMemo } from "react";
import EChart from "@/components/ui/EChart";
import Hive from "@/types/Hive";

const COLOR_LORENZ = "#6366f1";
const CHART_STYLE = { height: "100%", width: "100%" } as const;

export interface LorenzPoint {
  cumAccounts: number;
  cumHp: number;
}

export const buildLorenzCurve = (
  buckets: Hive.NetworkHpDistributionResponse[]
): LorenzPoint[] => {
  if (!buckets?.length) return [];

  // A Lorenz curve orders the population poorest -> richest by per-account wealth
  // (mean HP = total_hp / account_count), not by the bucket's aggregate total_hp
  // — a populous middle bucket can have a large aggregate but a small mean.
  const meanHp = (b: Hive.NetworkHpDistributionResponse) =>
    b.account_count > 0 ? b.total_hp / b.account_count : 0;
  const ordered = [...buckets].sort((a, b) => meanHp(a) - meanHp(b));

  const totalAccounts = ordered.reduce((s, b) => s + b.account_count, 0);
  const totalHp = ordered.reduce((s, b) => s + b.total_hp, 0);
  if (totalAccounts <= 0 || totalHp <= 0) return [];

  const points: LorenzPoint[] = [{ cumAccounts: 0, cumHp: 0 }];
  let accAcc = 0;
  let accHp = 0;
  ordered.forEach((b) => {
    accAcc += b.account_count;
    accHp += b.total_hp;
    points.push({
      cumAccounts: (accAcc / totalAccounts) * 100,
      cumHp: (accHp / totalHp) * 100,
    });
  });
  return points;
};

interface Props {
  buckets: Hive.NetworkHpDistributionResponse[];
  isDark: boolean;
  textColor: string;
  gridColor: string;
  locale: string;
  isRTL: boolean;
  t: (key: string, options?: Record<string, unknown>) => string;
}

const LorenzConcentrationChart: React.FC<Props> = ({
  buckets,
  isDark,
  textColor,
  gridColor,
  locale,
  isRTL,
  t,
}) => {
  const option = useMemo(() => {
    const fmtPct = (v: number) =>
      v < 0.005
        ? "<0.01"
        : v.toLocaleString(locale, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });

    const mutedColor = isDark ? "#9ca3af" : "#6b7280";
    const curve = buildLorenzCurve(buckets).map((p) => [
      p.cumAccounts,
      p.cumHp,
    ]);
    const valueAxis = {
      type: "value" as const,
      min: 0,
      max: 100,
      axisLabel: { color: textColor, fontSize: 9, formatter: "{value}%" },
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: {
        show: true,
        lineStyle: { color: gridColor, type: "dashed" as const, width: 1 },
      },
    };
    return {
      tooltip: {
        trigger: "item",
        formatter: (p: { data?: number[] }) => {
          if (!p.data) return "";
          const [x, y] = p.data;
          return `<div style="max-width:230px;line-height:1.5;white-space:normal;word-break:break-word;direction:${
            isRTL ? "rtl" : "ltr"
          };text-align:${isRTL ? "right" : "left"}">${t(
            "networkHpDistributionCard.lorenzTooltip",
            { accounts: fmtPct(x), hp: fmtPct(y) }
          )}</div>`;
        },
        backgroundColor: isDark ? "#1f2937" : "#ffffff",
        borderColor: isDark ? "#374151" : "#e5e7eb",
        textStyle: { color: textColor, fontSize: 11 },
      },
      grid: { left: 8, right: 12, top: 12, bottom: 26, containLabel: true },
      xAxis: {
        ...valueAxis,
        inverse: isRTL,
        name: t("networkHpDistributionCard.axisAccounts"),
        nameLocation: "middle" as const,
        nameGap: 28,
        nameTextStyle: { color: mutedColor, fontSize: 10 },
      },
      yAxis: {
        ...valueAxis,
        position: isRTL ? ("right" as const) : ("left" as const),
        name: t("networkHpDistributionCard.axisHp"),
        nameTextStyle: { color: mutedColor, fontSize: 10 },
      },
      series: [
        {
          name: t("networkHpDistributionCard.equalityLine"),
          type: "line",
          data: [
            [0, 0],
            [100, 100],
          ],
          symbol: "none",
          silent: true,
          lineStyle: { color: mutedColor, width: 1, type: "dashed" },
          z: 1,
        },
        {
          name: t("networkHpDistributionCard.lorenzLine"),
          type: "line",
          data: curve,
          smooth: false,
          symbol: "none",
          lineStyle: { color: COLOR_LORENZ, width: 2.5 },
          areaStyle: { color: COLOR_LORENZ, opacity: 0.16 },
          z: 2,
        },
      ],
    };
  }, [buckets, isDark, textColor, gridColor, locale, isRTL, t]);

  return <EChart option={option} style={CHART_STYLE} notMerge />;
};

export default LorenzConcentrationChart;
