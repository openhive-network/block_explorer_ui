import React from "react";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import moment from "moment";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/i18n";
import Hive from "@/types/Hive";
import { formatCompact } from "@/utils/chartUtils";

interface DauKpiStripProps {
  data: Hive.DailyActiveUsersResponse[];
  granularity: "day" | "week" | "month";
  trendMetric?: "active_accounts" | "operations";
}

const DauKpiStrip: React.FC<DauKpiStripProps> = ({
  data,
  granularity,
  trendMetric = "active_accounts",
}) => {
  const { t, locale } = useI18n();

  if (data.length === 0) return null;

  const totalAccounts = data.reduce((s, d) => s + d.active_accounts, 0);
  const totalOps = data.reduce((s, d) => s + d.operations, 0);
  const avgAccounts = Math.round(totalAccounts / data.length);
  const opsPerUserNum =
    totalAccounts > 0
      ? data.reduce(
          (s, d) =>
            s + (d.active_accounts > 0 ? d.operations / d.active_accounts : 0),
          0
        ) / data.length
      : null;
  const opsPerUser =
    opsPerUserNum !== null
      ? opsPerUserNum.toLocaleString(locale, { maximumFractionDigits: 1 })
      : "—";

  const peakEntry = data.reduce((max, d) =>
    d[trendMetric] > max[trendMetric] ? d : max
  );

  // Trend excludes the current incomplete period (day/week/month)
  const currentPeriodStart = moment()
    .startOf(
      granularity === "day"
        ? "day"
        : granularity === "week"
          ? "isoWeek"
          : "month"
    )
    .format("YYYY-MM-DD");
  const completedData = data.filter((d) => d.period < currentPeriodStart);
  const first = data[0];
  const lastCompleted = completedData[completedData.length - 1];
  const firstVal = first[trendMetric];
  const lastVal = lastCompleted?.[trendMetric] ?? null;
  const trendPct =
    lastVal !== null && firstVal > 0
      ? ((lastVal - firstVal) / firstVal) * 100
      : null;
  const trendSign: 1 | -1 | 0 =
    trendPct === null ? 0 : trendPct > 0 ? 1 : trendPct < 0 ? -1 : 0;
  const TrendIcon =
    trendSign > 0 ? TrendingUp : trendSign < 0 ? TrendingDown : Minus;
  const trendColor =
    trendSign > 0
      ? "text-explorer-light-green"
      : trendSign < 0
        ? "text-rose-600 dark:text-rose-400"
        : "text-gray-500";

  const granularityKeyMap: Record<string, string> = {
    day: "common.day",
    week: "common.week",
    month: "common.month",
  };
  const periodLabel = t(granularityKeyMap[granularity] ?? "common.day");

  const peakDateFmt = granularity === "month" ? "MMM YYYY" : "MMM D, YYYY";

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
      <KpiTile
        label={t("dauKpiStrip.totalAccounts")}
        value={
          lastCompleted
            ? formatCompact(lastCompleted.active_accounts, locale)
            : "—"
        }
      />
      <KpiTile
        label={t("dauKpiStrip.totalOps")}
        value={formatCompact(totalOps, locale)}
      />
      <KpiTile
        label={t("dauKpiStrip.avgPer", { period: periodLabel })}
        value={formatCompact(avgAccounts, locale)}
        sub={t("dauKpiStrip.accounts")}
      />
      <KpiTile
        label={t("dauKpiStrip.opsPerUser")}
        value={opsPerUser}
        sub={t("dauKpiStrip.perPeriod")}
      />
      <KpiTile
        label={t("dauKpiStrip.peakPeriod")}
        value={moment(peakEntry.period).format(peakDateFmt)}
        sub={`${formatCompact(peakEntry[trendMetric], locale)} ${trendMetric === "active_accounts" ? t("dauKpiStrip.accounts") : "ops"}`}
      />
      <KpiTile
        label={t("dauKpiStrip.trend")}
        value={
          <span className={cn("inline-flex items-center gap-1", trendColor)}>
            <TrendIcon size={13} />
            {trendPct !== null
              ? `${trendPct >= 0 ? "+" : ""}${trendPct.toLocaleString(locale, { maximumFractionDigits: 1 })}%`
              : "—"}
          </span>
        }
        sub={t("dauKpiStrip.vsPeriodStart")}
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

export default DauKpiStrip;
