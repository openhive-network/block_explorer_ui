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

const TransactionStatisticsCard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useI18n();

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
    <div className="bg-theme rounded mt-4 shadow-md overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5">
        {/* Left Side: Total and Today Transactions */}
        <div className="md:col-span-1">
          <div className="flex flex-col space-y-4">
            {/* Total Transactions */}
            <div className="bg-explorer-extra-light-gray rounded-lg p-4 shadow-md">
              <h3 className="text-sm font-semibold uppercase tracking-wide mb-1 text-explorer-dark-gray dark:text-text">
                {t("transactionStatisticsCard.totalTransactions")}
              </h3>
              {isYearlyLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="animate-spin h-5 w-5" />
                </div>
              ) : (
                lastYearData && (
                  <p className="text-2xl font-bold text-explorer-dark-gray dark:text-text">
                    {totalTransactions?.toLocaleString()}
                  </p>
                )
              )}
            </div>

            {/* Today's Transactions */}
            <div className="bg-explorer-extra-light-gray rounded-lg p-4 shadow-md">
              <h3 className="text-sm font-semibold uppercase tracking-wide mb-1 text-explorer-dark-gray dark:text-text">
                {t("transactionStatisticsCard.todaysTransactions")}
              </h3>
              {isDailyLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="animate-spin h-5 w-5" />
                </div>
              ) : todayData ? (
                <>
                  <p className="text-2xl font-bold text-explorer-dark-gray dark:text-text">
                    {todayData.trx_count.toLocaleString()}
                  </p>
                  <div className="mt-3">
                    <p className=" text-sm">
                      {t("transactionStatisticsCard.avgTrxsBlock")}:{" "}
                      <span className="font-medium text-gray-700 dark:text-text">
                        {todayData.avg_trx}
                      </span>
                    </p>
                    <p className="text-sm">
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
        <div className="md:col-span-2">
          <div className="bg-explorer-extra-light-gray rounded-lg p-4 shadow-md h-full flex flex-col">
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-explorer-dark-gray dark:text-text">
                {t("transactionStatisticsCard.last30Days")}
              </h3>
              <button onClick={openModal} className="text-xs underline">
                {t("transactionStatisticsCard.fullChart")}
              </button>
            </div>
            {isChartLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin h-6 w-6" />
              </div>
            ) : (
              <div className="flex-grow min-h-[189px]">
                <TransactionStatisticsChart
                  data={chartData}
                  tickCount={4}
                  dateFormat="MMM D"
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
