import React from "react";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCompact } from "@/components/home/hpMomentumUtils";
import { useI18n } from "@/i18n/i18n";

interface HpMomentumKpiStripProps {
  net: number;
  up: number;
  down: number;
  trend: number | null;
  unit: "hp" | "vests";
}

const HpMomentumKpiStrip: React.FC<HpMomentumKpiStripProps> = ({
  net,
  up,
  down,
  trend,
  unit,
}) => {
  const { t, locale } = useI18n();
  const unitLabel = unit === "hp" ? "HP" : "VESTS";

  const trendSign: 1 | -1 | 0 =
    trend === null ? 0 : trend > 0 ? 1 : trend < 0 ? -1 : 0;
  const TrendIcon = trendSign > 0 ? ArrowUp : trendSign < 0 ? ArrowDown : Minus;
  const trendColor =
    trendSign > 0
      ? "text-emerald-600 dark:text-emerald-400"
      : trendSign < 0
        ? "text-rose-600 dark:text-rose-400"
        : "text-gray-500";

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
      <KpiTile
        label={t("hpMomentumChart.netFlow")}
        value={
          <span
            className={cn(
              net >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600 dark:text-rose-400"
            )}
          >
            {net >= 0 ? "+" : ""}
            {formatCompact(net, locale)} {unitLabel}
          </span>
        }
      />
      <KpiTile
        label={t("hpMomentumCard.poweredUp")}
        value={`${formatCompact(up, locale)} ${unitLabel}`}
      />
      <KpiTile
        label={t("hpMomentumCard.poweredDown")}
        value={`${formatCompact(down, locale)} ${unitLabel}`}
      />
      <KpiTile
        label={t("transferStatsKpiStrip.trend")}
        value={
          <span className={cn("inline-flex items-center gap-1", trendColor)}>
            <TrendIcon size={13} />
            {trend !== null
              ? `${trend >= 0 ? "+" : ""}${trend.toLocaleString(locale, {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })}%`
              : "—"}
          </span>
        }
        sub={t("transferStatsKpiStrip.vsPeriodStart")}
      />
    </div>
  );
};

const KpiTile: React.FC<{
  label: string;
  value: React.ReactNode;
  sub?: string;
}> = ({ label, value, sub }) => (
  <div className="rounded-md border border-gray-200 dark:border-gray-700 bg-theme px-3 py-2 shadow-sm">
    <div className="text-[11px] text-gray-500 dark:text-gray-400 mb-0.5 uppercase tracking-wide leading-none">
      {label}
    </div>
    <div className="text-sm font-semibold leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
      {value}
    </div>
    {sub && <div className="text-[10px] text-gray-400 mt-0.5">{sub}</div>}
  </div>
);

export default HpMomentumKpiStrip;
