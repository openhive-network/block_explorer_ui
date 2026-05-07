import React, { useMemo, useState } from "react";
import useTransferStatistics from "@/hooks/api/homePage/useTransferStatistics";
import { Loader2 } from "lucide-react";
import TransferVolumeChart from "./TransferVolumeChart";
import dynamic from "next/dynamic";
const TransferVolumeFullChartDialog = dynamic(
  () => import("./TransferVolumeFullChartDialog"),
  { ssr: false }
);
import { useI18n } from "../../i18n/i18n";
import { useSettings } from "@/contexts/SettingsContext";
import useDynamicGlobal from "@/hooks/api/homePage/useDynamicGlobal";
import { useHeadBlockNumber } from "@/contexts/HeadBlockContext";

const TransferVolumeCard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useI18n();
  const { settings } = useSettings();
  const { headBlockNumberData } = useHeadBlockNumber();
  const { dynamicGlobalData } = useDynamicGlobal(headBlockNumberData);

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
    transferStatistics: chartData,
    isTransferStatisticsLoading: isChartLoading,
    isTransferStatisticsError: isChartError,
  } = useTransferStatistics("daily", "HIVE", "asc", fromDate, undefined, true); // Set liveDataEnabled to true to make the API call

  // --- Memoized Data ---
  const todayData = useMemo(() => {
    if (!chartData || chartData.length === 0) return null;
    return chartData[chartData.length - 1]; // Get the last element for today's data
  }, [chartData]);

  // Adjust loading and error states to use chart's states
  const isDailyLoading = isChartLoading;
  const isDailyError = isChartError;

  const hivePrice = useMemo(() => {
    if (
      dynamicGlobalData?.headBlockDetails?.rawFeedPrice &&
      dynamicGlobalData?.headBlockDetails?.rawQuote
    ) {
      const baseAmount = parseFloat(
        dynamicGlobalData.headBlockDetails.rawFeedPrice.amount
      );
      const quoteAmount = parseFloat(
        dynamicGlobalData.headBlockDetails.rawQuote.amount
      );
      if (quoteAmount > 0) {
        return baseAmount / quoteAmount;
      }
    }
    return 0;
  }, [dynamicGlobalData]);

  const totalUsdValue = useMemo(() => {
    if (!todayData || !todayData.total_transfer_amount) return 0;
    // API provides total_transfer_amount as a string. Parse it to a number.
    const amount = parseFloat(todayData.total_transfer_amount);

    return amount * hivePrice;
  }, [todayData, hivePrice]);
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
        {/* Left Side: Today's Volume and Details */}
        <div className="md:col-span-1">
          <div className="flex flex-col space-y-4">
            {/* Today's Volume Card */}
            <div className="bg-explorer-extra-light-gray rounded-lg p-4 shadow-md">
              <h3 className="text-sm font-semibold uppercase tracking-wide mb-1 text-explorer-dark-gray dark:text-text">
                {t("transferVolumeCard.todaysVolume")}
              </h3>
              {isDailyLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="animate-spin h-5 w-5" />
                </div>
              ) : todayData ? (
                <p className="text-2xl font-bold text-explorer-dark-gray dark:text-text text-right">
                  $
                  {totalUsdValue.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                </p>
              ) : (
                <p className="text-gray-500 text-sm">
                  {t("common.noDataAvailable")}
                </p>
              )}
            </div>

            {/* Today's Details Card */}
            <div className="bg-explorer-extra-light-gray rounded-lg p-4 shadow-md">
              <h3 className="text-sm font-semibold uppercase tracking-wide mb-1 text-explorer-dark-gray dark:text-text">
                {t("transferVolumeCard.todaysDetails") || "Today's Details"}
              </h3>
              {isDailyLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="animate-spin h-5 w-5" />
                </div>
              ) : todayData ? (
                <div className="flex flex-col gap-1 mt-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">
                      {t("transferVolumeCard.totalTransferAmount")}:
                    </span>
                    <span className="font-medium text-gray-700 dark:text-text text-right">
                      {(
                        parseFloat(todayData.total_transfer_amount) ?? 0
                      ).toLocaleString()}{" "}
                      HIVE
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">
                      {t("transferVolumeCard.transferCount")}:
                    </span>
                    <span className="font-medium text-gray-700 dark:text-text text-right">
                      {(todayData.transfer_count ?? 0).toLocaleString()}
                    </span>
                  </div>
                </div>
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
                {t("transferVolumeCard.last30Days")}
              </h3>
              <button onClick={openModal} className="text-xs underline">
                {t("transferVolumeCard.fullChart")}
              </button>
            </div>
            {isChartLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin h-6 w-6" />
              </div>
            ) : (
              <div className="flex-grow min-h-[189px]">
                <TransferVolumeChart
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
      <TransferVolumeFullChartDialog
        isOpen={isModalOpen}
        onClose={closeModal}
        data={chartData}
      />
    </div>
  );
};

export default TransferVolumeCard;
