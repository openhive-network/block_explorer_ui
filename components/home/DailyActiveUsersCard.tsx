import React, { useMemo, useState } from "react";
import { Loader2, Activity, Zap, TrendingUp, TrendingDown } from "lucide-react";
import moment from "moment";
import dynamic from "next/dynamic";
import DailyActiveUsersChart, { DauMetric } from "./DailyActiveUsersChart";
import { useI18n } from "../../i18n/i18n";
import useDailyActiveUsers from "@/hooks/api/homePage/useDailyActiveUsers";
import { cn } from "@/lib/utils";

const DailyActiveUsersFullChartDialog = dynamic(
  () => import("./DailyActiveUsersFullChartDialog"),
  { ssr: false }
);

const TrendBadge: React.FC<{ value: number; locale: string }> = ({
  value,
  locale,
}) => {
  const isPositive = value > 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-[11px] font-semibold leading-none",
        isPositive
          ? "text-explorer-light-green"
          : "text-rose-600 dark:text-rose-400"
      )}
    >
      <Icon className="h-3 w-3" />
      {Math.abs(value).toLocaleString(locale, { maximumFractionDigits: 2 })}%
    </span>
  );
};

const METRIC_OPTIONS: { key: DauMetric; labelKey: string }[] = [
  { key: "active_accounts", labelKey: "dailyActiveUsersCard.activeAccounts" },
  { key: "operations", labelKey: "dailyActiveUsersCard.operations" },
];

const DailyActiveUsersCard = () => {
  const { t, locale } = useI18n();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [metric, setMetric] = useState<DauMetric>("active_accounts");

  const fromDate = useMemo(() => moment().subtract(30, "days").toDate(), []);

  const {
    dailyActiveUsers,
    isDailyActiveUsersLoading,
    isDailyActiveUsersError,
  } = useDailyActiveUsers(fromDate, undefined, "day");

  const chartData = useMemo(() => {
    if (!dailyActiveUsers || dailyActiveUsers.length === 0) return [];
    return [...dailyActiveUsers].sort((a, b) => (a.period < b.period ? -1 : 1));
  }, [dailyActiveUsers]);

  const lastCompletedEntry = useMemo(() => {
    const todayStr = moment().format("YYYY-MM-DD");
    return [...chartData].reverse().find((d) => d.period < todayStr) ?? null;
  }, [chartData]);

  const avg30dDau = useMemo(() => {
    if (!chartData.length) return null;
    return Math.round(
      chartData.reduce((s, d) => s + d.active_accounts, 0) / chartData.length
    );
  }, [chartData]);

  const avg30dOps = useMemo(() => {
    if (!chartData.length) return null;
    return Math.round(
      chartData.reduce((s, d) => s + d.operations, 0) / chartData.length
    );
  }, [chartData]);

  const trendDau = useMemo(() => {
    if (!lastCompletedEntry || chartData.length < 2) return null;
    const first = chartData[0].active_accounts;
    return first > 0
      ? ((lastCompletedEntry.active_accounts - first) / first) * 100
      : null;
  }, [chartData, lastCompletedEntry]);

  const trendOps = useMemo(() => {
    if (!lastCompletedEntry || chartData.length < 2) return null;
    const first = chartData[0].operations;
    return first > 0
      ? ((lastCompletedEntry.operations - first) / first) * 100
      : null;
  }, [chartData, lastCompletedEntry]);

  return (
    <div className="bg-theme rounded mb-2 shadow-md overflow-hidden">
      <div className="flex flex-wrap gap-2 p-2">
        {/* KPI — Active Accounts */}
        <div className="flex-1 min-w-[140px] bg-explorer-extra-light-gray rounded-lg p-2.5 shadow-md flex flex-col justify-center">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-explorer-dark-gray dark:text-text">
            {t("dailyActiveUsersCard.latestDau")} (30D)
          </h3>
          {isDailyActiveUsersLoading ? (
            <Loader2 className="animate-spin h-4 w-4 mt-1" />
          ) : isDailyActiveUsersError ? (
            <p className="text-red-500 text-[11px] mt-1">
              {t("common.errorLoadingData")}
            </p>
          ) : lastCompletedEntry ? (
            <>
              <div className="flex items-baseline gap-1.5">
                <p className="text-xl font-bold leading-tight text-explorer-dark-gray dark:text-text">
                  {lastCompletedEntry.active_accounts.toLocaleString(locale)}
                </p>
                {trendDau !== null && (
                  <TrendBadge value={trendDau} locale={locale} />
                )}
              </div>
              <p className="flex items-center gap-1 text-[11px] text-gray-500">
                <Activity className="h-3 w-3" />
                {avg30dDau !== null &&
                  `${avg30dDau.toLocaleString(locale)} ${t("dailyActiveUsersCard.avg30d")}`}
              </p>
            </>
          ) : (
            <p className="text-gray-500 text-xs mt-1">
              {t("common.noDataAvailable")}
            </p>
          )}
        </div>

        {/* KPI — Operations */}
        <div className="flex-1 min-w-[140px] bg-explorer-extra-light-gray rounded-lg p-2.5 shadow-md flex flex-col justify-center">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-explorer-dark-gray dark:text-text">
            {t("dailyActiveUsersCard.latestOps")} (30D)
          </h3>
          {isDailyActiveUsersLoading ? (
            <Loader2 className="animate-spin h-4 w-4 mt-1" />
          ) : isDailyActiveUsersError ? (
            <p className="text-red-500 text-[11px] mt-1">
              {t("common.errorLoadingData")}
            </p>
          ) : lastCompletedEntry ? (
            <>
              <div className="flex items-baseline gap-1.5">
                <p className="text-xl font-bold leading-tight text-explorer-dark-gray dark:text-text">
                  {lastCompletedEntry.operations.toLocaleString(locale)}
                </p>
                {trendOps !== null && (
                  <TrendBadge value={trendOps} locale={locale} />
                )}
              </div>
              <p className="flex items-center gap-1 text-[11px] text-gray-500">
                <Zap className="h-3 w-3" />
                {avg30dOps !== null &&
                  `${avg30dOps.toLocaleString(locale)} ${t("dailyActiveUsersCard.avg30d")}`}
              </p>
            </>
          ) : (
            <p className="text-gray-500 text-xs mt-1">
              {t("common.noDataAvailable")}
            </p>
          )}
        </div>

        {/* Chart panel */}
        <div className="flex-[2] min-w-[220px] bg-explorer-extra-light-gray rounded-lg p-2.5 shadow-md flex flex-col">
          <div className="flex justify-between items-center mb-1">
            <div className="flex gap-1">
              {METRIC_OPTIONS.map(({ key, labelKey }) => (
                <button
                  key={key}
                  onClick={() => setMetric(key)}
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded font-medium transition-colors",
                    metric === key
                      ? "bg-indigo-500 text-white"
                      : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  )}
                >
                  {t(labelKey)}
                </button>
              ))}
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-xs underline"
            >
              {t("dailyActiveUsersCard.fullChart")}
            </button>
          </div>

          {isDailyActiveUsersLoading ? (
            <div className="flex items-center justify-center flex-grow min-h-[100px]">
              <Loader2 className="animate-spin h-5 w-5" />
            </div>
          ) : (
            <div className="flex-grow min-h-[100px] overflow-hidden">
              <DailyActiveUsersChart
                data={chartData}
                metric={metric}
                tickCount={4}
                dateFormat="MMM D"
                compact
              />
            </div>
          )}
        </div>
      </div>

      <DailyActiveUsersFullChartDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default DailyActiveUsersCard;
