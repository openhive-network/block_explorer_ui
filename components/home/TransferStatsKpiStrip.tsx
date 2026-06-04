import React from "react";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import moment from "moment";
import { cn } from "@/lib/utils";
import { formatCompact } from "@/components/home/hpMomentumUtils";
import { useI18n } from "@/i18n/i18n";

interface TransferStatsKpiStripProps {
  totalVolume: number;
  totalTxns: number;
  avgPerPeriod: number;
  peakDate: number | null;
  peakValue: number;
  trend: number | null;
  coinType: "HIVE" | "HBD";
  granularity: "hourly" | "daily" | "monthly" | "yearly";
}

const TransferStatsKpiStrip: React.FC<TransferStatsKpiStripProps> = ({
  totalVolume,
  totalTxns,
  avgPerPeriod,
  peakDate,
  peakValue,
  trend,
  coinType,
  granularity,
}) => {
  const { t } = useI18n();

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
    hourly: "common.hour",
    daily: "common.day",
    monthly: "common.month",
    yearly: "common.year",
  };
  const periodLabel = t(granularityKeyMap[granularity] ?? "common.day");

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
      <KpiTile
        label={t("transferStatsKpiStrip.totalVolume")}
        value={`${formatCompact(totalVolume)} ${coinType}`}
      />
      <KpiTile
        label={t("transferStatsKpiStrip.totalTransactions")}
        value={totalTxns.toLocaleString()}
        sub={t("transferStatsKpiStrip.transfers")}
      />
      <KpiTile
        label={t("transferStatsKpiStrip.avgPer", { period: periodLabel })}
        value={`${formatCompact(avgPerPeriod)} ${coinType}`}
      />
      <KpiTile
        label={t("transferStatsKpiStrip.peakPeriod")}
        value={
          peakDate !== null
            ? moment(peakDate).format(
                granularity === "hourly" ? "MMM D, HH:mm" : "MMM D, YYYY"
              )
            : "—"
        }
        sub={
          peakDate !== null
            ? `${formatCompact(peakValue)} ${coinType}`
            : undefined
        }
      />
      <KpiTile
        label={t("transferStatsKpiStrip.trend")}
        value={
          <span className={cn("inline-flex items-center gap-1", trendColor)}>
            <TrendIcon size={13} />
            {trend !== null
              ? `${trend >= 0 ? "+" : ""}${trend.toFixed(1)}%`
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

export default TransferStatsKpiStrip;
