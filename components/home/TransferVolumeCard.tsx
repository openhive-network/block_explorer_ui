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
import useDynamicGlobal from "@/hooks/api/homePage/useDynamicGlobal";
import { useHeadBlockNumber } from "@/contexts/HeadBlockContext";
import { cn } from "@/lib/utils";

type CoinType = "HIVE" | "HBD";

const coinOptions: { key: CoinType; label: string }[] = [
  { key: "HIVE", label: "HIVE" },
  { key: "HBD", label: "HBD" },
];

const TransferVolumeCard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [coinType, setCoinType] = useState<CoinType>("HIVE");
  const { t } = useI18n();
  const { headBlockNumberData } = useHeadBlockNumber();
  const { dynamicGlobalData } = useDynamicGlobal(headBlockNumberData);

  const fromDate = useMemo(() => {
    const today = new Date();
    const d = new Date(today);
    d.setDate(today.getDate() - 30);
    return d;
  }, []);

  const {
    transferStatistics: chartData,
    isTransferStatisticsLoading: isChartLoading,
    isTransferStatisticsError: isChartError,
  } = useTransferStatistics(
    "daily",
    coinType,
    "asc",
    fromDate,
    undefined,
    true
  );

  const todayData = useMemo(() => {
    if (!chartData || chartData.length === 0) return null;
    return chartData[chartData.length - 1];
  }, [chartData]);

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
    const amount =
      parseFloat(todayData.total_transfer_amount.amount) /
        Math.pow(10, todayData.total_transfer_amount.precision) || 0;
    // HBD is pegged to $1
    return coinType === "HBD" ? amount : amount * hivePrice;
  }, [todayData, hivePrice, coinType]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="bg-theme rounded mb-2 shadow-md overflow-hidden">
      <div className="flex flex-wrap gap-4 p-5">
        <div className="flex-1 min-w-[200px]">
          <div className="flex flex-col space-y-4">
            <div className="bg-explorer-extra-light-gray rounded-lg p-4 shadow-md">
              <h3 className="text-sm font-semibold uppercase tracking-wide mb-1 text-explorer-dark-gray dark:text-text">
                {t("transferVolumeCard.todaysVolume")}
              </h3>
              {isChartLoading ? (
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

            <div className="bg-explorer-extra-light-gray rounded-lg p-4 shadow-md">
              <h3 className="text-sm font-semibold uppercase tracking-wide mb-1 text-explorer-dark-gray dark:text-text">
                {t("transferVolumeCard.todaysDetails")}
              </h3>
              {isChartLoading ? (
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
                        parseFloat(todayData.total_transfer_amount.amount) /
                          Math.pow(
                            10,
                            todayData.total_transfer_amount.precision
                          ) || 0
                      ).toLocaleString()}{" "}
                      {coinType}
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
              {isChartError && (
                <p className="text-red-500 text-xs mt-1">
                  {t("common.errorLoadingData")}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex-[2] min-w-[260px]">
          <div className="bg-explorer-extra-light-gray rounded-lg p-4 shadow-md h-full flex flex-col">
            <div className="flex justify-between items-center mb-1 gap-2 flex-wrap">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-explorer-dark-gray dark:text-text">
                {t("transferVolumeCard.last30Days")}
              </h3>
              <div className="flex items-center gap-3">
                <div
                  className="inline-flex items-stretch rounded-full border border-navbar-border overflow-hidden text-[10px]"
                  role="group"
                  aria-label="HIVE or HBD"
                >
                  {coinOptions.map((opt, idx) => {
                    const isActive = coinType === opt.key;
                    const isFirst = idx === 0;
                    const isLast = idx === coinOptions.length - 1;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setCoinType(opt.key)}
                        aria-pressed={isActive}
                        className={cn(
                          "font-medium transition-colors px-2 py-0.5",
                          !isLast && "border-r border-navbar-border",
                          isFirst && "rounded-l-full",
                          isLast && "rounded-r-full",
                          isActive
                            ? "bg-blue-500 text-white"
                            : "bg-theme hover:bg-gray-100 dark:hover:bg-gray-700"
                        )}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={openModal}
                  className="text-[11px] underline text-explorer-dark-gray dark:text-text"
                >
                  {t("transferVolumeCard.fullChart")}
                </button>
              </div>
            </div>
            {isChartLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin h-6 w-6" />
              </div>
            ) : (
              <div className="flex-grow min-h-[189px]">
                <TransferVolumeChart
                  data={chartData}
                  coinType={coinType}
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

      <TransferVolumeFullChartDialog
        isOpen={isModalOpen}
        onClose={closeModal}
        data={chartData}
        initialCoinType={coinType}
      />
    </div>
  );
};

export default TransferVolumeCard;
