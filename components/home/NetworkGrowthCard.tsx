import React, { useMemo, useState } from "react";
import { Loader2, TrendingUp, Users } from "lucide-react";
import moment from "moment";
import dynamic from "next/dynamic";
import NetworkGrowthChart from "./NetworkGrowthChart";
const NetworkGrowthFullChartDialog = dynamic(
  () => import("./NetworkGrowthFullChartDialog"),
  { ssr: false }
);
import { useI18n } from "../../i18n/i18n";
import { useSettings } from "@/contexts/SettingsContext";
import useTotalWalletAddresses from "@/hooks/api/homePage/useTotalWalletAddresses";

const NetworkGrowthCard = () => {
  const { t } = useI18n();
  const { settings } = useSettings();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // TEMP (dev): the HAF dev node is re-syncing from genesis and has no recent
  // data yet. Restore moment().subtract(30, "days") before release.
  const fromDate = useMemo(
    () => moment("2016-05-01 00:00:00", "YYYY-MM-DD HH:mm:ss").toDate(),
    []
  );

  // Headline total = every wallet on the chain, fetched with no date range.
  const {
    walletStats: totalsData,
    isWalletStatsLoading: isTotalLoading,
    isWalletStatsError: isTotalError,
  } = useTotalWalletAddresses(
    "yearly",
    "desc",
    undefined,
    undefined,
    settings.liveData
  );

  // Last 30 days of daily chain data, for the growth chart and its stats.
  const {
    walletStats: windowData,
    isWalletStatsLoading: isWindowLoading,
    isWalletStatsError: isWindowError,
  } = useTotalWalletAddresses("daily", "asc", fromDate, undefined, false);

  const totalAccounts = useMemo(() => {
    if (!totalsData || totalsData.length === 0) return null;
    return totalsData[0].total_wallets;
  }, [totalsData]);

  const chartData = useMemo(() => {
    if (!windowData || windowData.length === 0) return [];
    return windowData.slice(-30);
  }, [windowData]);

  const stats = useMemo(() => {
    if (chartData.length === 0) return null;
    const newAccounts = chartData.reduce(
      (sum, item) => sum + (item.new_wallets ?? 0),
      0
    );
    const baseTotal =
      chartData[0].total_wallets - (chartData[0].new_wallets ?? 0);
    const growthPct = baseTotal > 0 ? (newAccounts / baseTotal) * 100 : 0;
    const avgPerDay = newAccounts / chartData.length;
    return { newAccounts, growthPct, avgPerDay };
  }, [chartData]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="bg-theme rounded mb-2 shadow-md overflow-hidden">
      <div className="flex flex-wrap gap-2 p-2">
        {/* Total Accounts (all wallets on the chain) */}
        <div className="flex-1 min-w-[140px] bg-explorer-extra-light-gray rounded-lg p-2.5 shadow-md flex flex-col justify-center">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-explorer-dark-gray dark:text-text">
            {t("networkGrowthCard.totalAccounts")}
          </h3>
          {isTotalLoading ? (
            <Loader2 className="animate-spin h-4 w-4 mt-1" />
          ) : isTotalError ? (
            <p className="text-red-500 text-[11px] mt-1">
              {t("common.errorLoadingData")}
            </p>
          ) : totalAccounts !== null ? (
            <>
              <p className="text-xl font-bold leading-tight text-explorer-dark-gray dark:text-text">
                {totalAccounts.toLocaleString()}
              </p>
              <p className="flex items-center gap-1 text-[11px] text-gray-500">
                <Users className="h-3 w-3" />
                {t("networkGrowthCard.accountsOnHive")}
              </p>
            </>
          ) : (
            <p className="text-gray-500 text-xs mt-1">
              {t("common.noDataAvailable")}
            </p>
          )}
        </div>

        {/* New Accounts in the last 30 days */}
        <div className="flex-1 min-w-[140px] bg-explorer-extra-light-gray rounded-lg p-2.5 shadow-md flex flex-col justify-center">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-explorer-dark-gray dark:text-text">
            {t("networkGrowthCard.newAccounts")} (30D)
          </h3>
          {isWindowLoading ? (
            <Loader2 className="animate-spin h-4 w-4 mt-1" />
          ) : isWindowError ? (
            <p className="text-red-500 text-[11px] mt-1">
              {t("common.errorLoadingData")}
            </p>
          ) : stats ? (
            <>
              <div className="flex items-center gap-1.5 leading-tight">
                <p className="text-xl font-bold text-explorer-dark-gray dark:text-text">
                  +{stats.newAccounts.toLocaleString()}
                </p>
                <span className="flex items-center gap-0.5 text-[11px] font-semibold text-explorer-light-green">
                  <TrendingUp className="h-3 w-3" />
                  {stats.growthPct.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                  %
                </span>
              </div>
              <p className="text-[11px] text-gray-500">
                <span className="font-medium text-gray-700 dark:text-text">
                  {stats.avgPerDay.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}
                </span>{" "}
                {t("networkGrowthCard.avgPerDay")}
              </p>
            </>
          ) : (
            <p className="text-gray-500 text-xs mt-1">
              {t("common.noDataAvailable")}
            </p>
          )}
        </div>

        {/* Cumulative Growth Chart (last 30 days) */}
        <div className="flex-[2] min-w-[220px] bg-explorer-extra-light-gray rounded-lg p-2.5 shadow-md flex flex-col">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-explorer-dark-gray dark:text-text">
              {t("networkGrowthCard.accountGrowth")}
            </h3>
            <button onClick={openModal} className="text-xs underline">
              {t("networkGrowthCard.fullChart")}
            </button>
          </div>
          {isWindowLoading ? (
            <div className="flex items-center justify-center flex-grow min-h-[100px]">
              <Loader2 className="animate-spin h-5 w-5" />
            </div>
          ) : (
            <div className="flex-grow min-h-[100px]">
              <NetworkGrowthChart
                data={chartData}
                tickCount={4}
                dateFormat="MMM D"
                compact
              />
            </div>
          )}
        </div>
      </div>

      <NetworkGrowthFullChartDialog isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
};

export default NetworkGrowthCard;
