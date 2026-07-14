import React from "react";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import moment from "moment";
import { cn } from "@/lib/utils";
import { formatCompact } from "@/components/home/hpMomentumUtils";
import { useI18n } from "@/i18n/i18n";

interface TxStatsKpiStripProps {
  totalTxns: number;
  avgPerPeriod: number;
  peakDate: number | null;
  peakValue: number;
  trend: number | null;
  granularity: "daily" | "monthly" | "yearly";
}

const TxStatsKpiStrip: React.FC<TxStatsKpiStripProps> = ({
  totalTxns,
  avgPerPeriod,
  peakDate,
  peakValue,
  trend,
  granularity,
}) => {
  const { t, locale } = useI18n();

  const trendSign: 1 | -1 | 0 =
    trend === null ? 0 : trend > 0 ? 1 : trend < 0 ? -1 : 0;
  const TrendIcon = trendSign > 0 ? ArrowUp : trendSign < 0 ? ArrowDown : Minus;
  const trendColor =
    trendSign > 0
      ? "text-emerald-600 dark:text-emerald-400"
      : trendSign < 0
        ? "text-rose-600 dark:text-rose-400"
        : "text-gray-500";

  const granularityKeyMap: Record<string, string> = {
    daily: "common.day",
    monthly: "common.month",
    yearly: "common.year",
  };
  const periodLabel = t(granularityKeyMap[granularity] ?? "common.day");

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
      <KpiTile
        label={t("transactionStatisticsCard.totalTransactions")}
        value={totalTxns.toLocaleString(locale)}
      />
      <KpiTile
        label={t("transferStatsKpiStrip.avgPer", { period: periodLabel })}
        value={formatCompact(avgPerPeriod, locale)}
      />
      <KpiTile
        label={t("transferStatsKpiStrip.peakPeriod")}
        value={peakDate !== null ? moment(peakDate).format("MMM D, YYYY") : "—"}
        sub={peakDate !== null ? formatCompact(peakValue, locale) : undefined}
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

export default TxStatsKpiStrip;
