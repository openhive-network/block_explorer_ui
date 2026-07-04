import React, { useMemo, useState } from "react";
import useTransactionStatistics from "@/hooks/api/homePage/useTransactionStatistics";
import { Loader2 } from "lucide-react";
import TransactionStatisticsChart from "./TransactionStatisticsChart";
import dynamic from "next/dynamic";
const TransactionStatisticsFullChartDialog = dynamic(
  () => import("./TransactionStatisticsFullChartDialog"),
  { ssr: false }
);
import { useI18n } from "../../i18n/i18n";
import { useSettings } from "@/contexts/SettingsContext";
import CardHeaderWithLink from "@/components/ui/CardHeaderWithLink";

const TransactionStatisticsCard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t, locale } = useI18n();

  const { settings } = useSettings();

  // --- Date Calculation ---
  const fromDate = useMemo(() => {
    const today = new Date();
    const fourteenDaysAgo = new Date(today);
    fourteenDaysAgo.setDate(today.getDate() - 30);
    return fourteenDaysAgo;
  }, []);

  const yesterday = useMemo(() => {
    const today = new Date();
    const yesterdayDate = new Date(today);
    yesterdayDate.setDate(today.getDate() - 1);
    return yesterdayDate;
  }, []);

  // --- API Calls ---
  const {
    transactionStatistics: dailyData,
    isTransactionStatisticsLoading: isDailyLoading,
    isTransactionStatisticsError: isDailyError,
  } = useTransactionStatistics(
    "daily",
    "desc",
    yesterday,
    undefined,
    settings.liveData
  );

  const {
    transactionStatistics: chartData,
    isTransactionStatisticsLoading: isChartLoading,
    isTransactionStatisticsError: isChartError,
  } = useTransactionStatistics("daily", "asc", fromDate, yesterday, false);

  const {
    transactionStatistics: yearlyData,
    isTransactionStatisticsLoading: isYearlyLoading,
    isTransactionStatisticsError: isYearlyError,
  } = useTransactionStatistics(
    "yearly",
    "desc",
    undefined,
    undefined,
    settings.liveData
  );

  // --- Memoized Data ---
  const lastYearData = useMemo(() => {
    if (!yearlyData) return null;
    return yearlyData[0];
  }, [yearlyData]);

  const todayData = useMemo(() => {
    if (!dailyData) return null;
    return dailyData[0];
  }, [dailyData]);

  const totalTransactions = useMemo(() => {
    if (!yearlyData || !Array.isArray(yearlyData)) return 0;
    return yearlyData.reduce((sum, item) => sum + item.trx_count, 0);
  }, [yearlyData]);

  // --- Modal Handlers ---
  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="bg-theme rounded mb-2 shadow-md overflow-hidden">
      <CardHeaderWithLink
        title={t("common.transactions")}
        actions={
          <button
            onClick={openModal}
            className="text-[13px] underline text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            {t("common.fullChart")}
          </button>
        }
      />
      <div className="flex flex-wrap gap-3 p-3">
        {/* Left Side: Total and Today Transactions */}
        <div className="flex-1 min-w-[200px]">
          <div className="flex flex-col space-y-3">
            {/* Total Transactions */}
            <div className="bg-explorer-extra-light-gray rounded-lg p-3 shadow-md">
              <h3 className="text-sm font-semibold uppercase tracking-wide mb-1 text-explorer-dark-gray dark:text-text">
                {t("transactionStatisticsCard.totalTransactions")}
              </h3>
              {isYearlyLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="animate-spin h-5 w-5" />
                </div>
              ) : (
                lastYearData && (
                  <p className="text-lg font-bold text-explorer-dark-gray dark:text-text">
                    {totalTransactions?.toLocaleString(locale)}
                  </p>
                )
              )}
            </div>

            {/* Today's Transactions */}
            <div className="bg-explorer-extra-light-gray rounded-lg p-3 shadow-md">
              <h3 className="text-sm font-semibold uppercase tracking-wide mb-1 text-explorer-dark-gray dark:text-text">
                {t("transactionStatisticsCard.todaysTransactions")}
              </h3>
              {isDailyLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="animate-spin h-5 w-5" />
                </div>
              ) : todayData ? (
                <>
                  <p className="text-lg font-bold text-explorer-dark-gray dark:text-text">
                    {todayData.trx_count.toLocaleString(locale)}
                  </p>
                  <div className="mt-2">
                    <p className="text-xs">
                      {t("transactionStatisticsCard.avgTrxsBlock")}:{" "}
                      <span className="font-medium text-gray-700 dark:text-text">
                        {todayData.avg_trx}
                      </span>
                    </p>
                    <p className="text-xs">
                      {t("transactionStatisticsCard.maxTrxBlock")}:{" "}
                      <span className="font-medium text-gray-700 dark:text-text">
                        {todayData.max_trx}
                      </span>
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-gray-500 text-sm">
                  {t("common.noDataAvailable")}
                </p>
              )}
              {isDailyError && (
                <p className="text-red-500 text-xs mt-1">
                  {t("common.errorLoadingData")}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Last 30 Days Chart */}
        <div className="flex-[2] min-w-[260px]">
          <div className="bg-explorer-extra-light-gray rounded-lg p-3 shadow-md h-full flex flex-col">
            <h3 className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">
              {t("transactionStatisticsCard.last30Days")}
            </h3>
            {isChartLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin h-6 w-6" />
              </div>
            ) : (
              <div className="flex-grow min-h-[150px]">
                <TransactionStatisticsChart
                  data={chartData}
                  tickCount={4}
                  dateFormat="MMM D"
                  showLegend={false}
                />
              </div>
            )}
            {isChartError && (
              <p className="text-red-500 text-xs mt-1">
                {t("common.errorLoadingData")}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Render the modal */}
      <TransactionStatisticsFullChartDialog
        isOpen={isModalOpen}
        onClose={closeModal}
        data={chartData}
      />
    </div>
  );
};

export default TransactionStatisticsCard;
