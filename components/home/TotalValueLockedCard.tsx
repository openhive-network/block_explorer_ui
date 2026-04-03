import React, { useMemo } from "react";
import { Loader2 } from "lucide-react";
import { useI18n } from "../../i18n/i18n";
import { useSettings } from "@/contexts/SettingsContext";
import useDynamicGlobal from "@/hooks/api/homePage/useDynamicGlobal";
import { useHeadBlockNumber } from "@/contexts/HeadBlockContext";
import useTotalValueLocked from "@/hooks/api/homePage/useTotalValueLocked";
import { useHiveChainContext } from "@/contexts/HiveChainContext";

import { grabNumericValue } from "@/utils/StringUtils";

import { convertVestsToHP } from "@/utils/Calculations";

const TotalValueLockedCard = () => {
  const { t } = useI18n();
  const { settings } = useSettings();
  const { hiveChain } = useHiveChainContext();
  const { headBlockNumberData } = useHeadBlockNumber();
  const { dynamicGlobalData } = useDynamicGlobal(headBlockNumberData);

  const {
    totalValueLocked,
    isTotalValueLockedLoading,
    isTotalValueLockedError,
  } = useTotalValueLocked(settings.liveData);

  const hivePrice = useMemo(() => {
    if (
      dynamicGlobalData?.headBlockDetails?.rawFeedPrice &&
      dynamicGlobalData?.headBlockDetails?.rawQuote
    ) {
      const baseAmount = grabNumericValue(
        hiveChain!.formatter.format(
          dynamicGlobalData.headBlockDetails.rawFeedPrice
        )
      );
      const quoteAmount = grabNumericValue(
        hiveChain!.formatter.format(dynamicGlobalData.headBlockDetails.rawQuote)
      );
      if (quoteAmount > 0) {
        return baseAmount / quoteAmount;
      }
    }
    return 0;
  }, [dynamicGlobalData, hiveChain]);

  const tvlDetails = useMemo(() => {
    if (!totalValueLocked || !hiveChain || !dynamicGlobalData) return null;

    const { total_vests, savings_hive, savings_hbd } = totalValueLocked;
    const { rawTotalVestingFundHive, rawTotalVestingShares } =
      dynamicGlobalData.headBlockDetails;

    // Convert VESTS to HP
    // The total_vests from the TVL API is a raw integer string with 6 decimals precision
    const totalHpString = convertVestsToHP(
      hiveChain,
      {
        amount: total_vests,
        precision: 6,
        nai: "@@000000037",
      },
      rawTotalVestingFundHive,
      rawTotalVestingShares
    );
    const totalHpValue = grabNumericValue(totalHpString || "0");
    const totalVestsUsd = totalHpValue * hivePrice;

    // Savings HIVE to USD (3 decimals precision)
    const totalSavingsHiveValue = grabNumericValue(savings_hive) / 1000;
    const totalSavingsHiveUsd = totalSavingsHiveValue * hivePrice;

    // Savings HBD to USD (3 decimals precision)
    const totalSavingsHbdValue = grabNumericValue(savings_hbd) / 1000;
    const totalSavingsHbdUsd = totalSavingsHbdValue; // HBD is stable-ish

    const totalUsdValue =
      totalVestsUsd + totalSavingsHiveUsd + totalSavingsHbdUsd;

    return {
      totalVestsUsd,
      totalSavingsHiveUsd,
      totalSavingsHbdUsd,
      totalUsdValue,
      totalVests: totalHpValue,
      totalVestsRaw: grabNumericValue(total_vests) / 1000000,
      totalSavingsHive: totalSavingsHiveValue,
      totalSavingsHbd: totalSavingsHbdValue,
    };
  }, [totalValueLocked, hiveChain, dynamicGlobalData, hivePrice]);

  return (
    <div className="bg-theme rounded mt-4 shadow-md overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5">
        {/* Left Side: Total USD Value */}
        <div className="md:col-span-1">
          <div className="bg-explorer-extra-light-gray rounded-lg p-4 shadow-md h-full flex flex-col justify-center">
            <h3 className="text-sm font-semibold uppercase tracking-wide mb-1 text-explorer-dark-gray dark:text-text">
              {t("totalValueLockedCard.totalValueLocked")}
            </h3>
            {isTotalValueLockedLoading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="animate-spin h-5 w-5" />
              </div>
            ) : tvlDetails ? (
              <p className="text-2xl font-bold text-explorer-dark-gray dark:text-text text-right">
                ${tvlDetails.totalUsdValue.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}
              </p>
            ) : (
              <p className="text-gray-500 text-sm">
                {t("common.noDataAvailable")}
              </p>
            )}
          </div>
        </div>

        {/* Right Side: Detailed breakdown */}
        <div className="md:col-span-2">
          <div className="bg-explorer-extra-light-gray rounded-lg p-4 shadow-md h-full">
            <div className="flex flex-col gap-3">
              {/* Total VESTS (HP) */}
              <div className="flex justify-between items-center border-b pb-2 dark:border-gray-700">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-explorer-dark-gray dark:text-text">
                    {t("totalValueLockedCard.totalVests")}
                  </span>
                  <span className="text-xs text-gray-500">
                    {settings.displayVestHpMode === "hp"
                      ? `${tvlDetails?.totalVests.toLocaleString()} HP`
                      : `${tvlDetails?.totalVestsRaw.toLocaleString()} VESTS`}
                  </span>
                </div>
                <span className="font-bold text-explorer-dark-gray dark:text-text">
                  ${tvlDetails?.totalVestsUsd.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>

              {/* Total HIVE Savings */}
              <div className="flex justify-between items-center border-b pb-2 dark:border-gray-700">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-explorer-dark-gray dark:text-text">
                    {t("totalValueLockedCard.totalHiveSavings")}
                  </span>
                  <span className="text-xs text-gray-500">
                    {tvlDetails?.totalSavingsHive.toLocaleString()} HIVE
                  </span>
                </div>
                <span className="font-bold text-explorer-dark-gray dark:text-text">
                  ${tvlDetails?.totalSavingsHiveUsd.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>

              {/* Total HBD Savings */}
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-explorer-dark-gray dark:text-text">
                    {t("totalValueLockedCard.totalHbdSavings")}
                  </span>
                  <span className="text-xs text-gray-500">
                    {tvlDetails?.totalSavingsHbd.toLocaleString()} HBD
                  </span>
                </div>
                <span className="font-bold text-explorer-dark-gray dark:text-text">
                  ${tvlDetails?.totalSavingsHbdUsd.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isTotalValueLockedError && (
        <p className="text-red-500 text-xs p-2 text-center">
          {t("common.errorLoadingData")}
        </p>
      )}
    </div>
  );
};

export default TotalValueLockedCard;
