import React, { useMemo } from "react";
import { Loader2, Lock } from "lucide-react";
import { useI18n } from "../../i18n/i18n";
import { useSettings } from "@/contexts/SettingsContext";
import useDynamicGlobal from "@/hooks/api/homePage/useDynamicGlobal";
import { useHeadBlockNumber } from "@/contexts/HeadBlockContext";
import useTotalValueLocked from "@/hooks/api/homePage/useTotalValueLocked";
import { useHiveChainContext } from "@/contexts/HiveChainContext";
import Hive from "@/types/Hive";

import { grabNumericValue } from "@/utils/StringUtils";

import { convertVestsToHP } from "@/utils/Calculations";
import CardHeaderWithLink from "@/components/ui/CardHeaderWithLink";

const TotalValueLockedCard = () => {
  const { t, locale } = useI18n();
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

    // The total_vests from the TVL API is a raw integer string with 6 decimals precision
    const totalVestsSupply: Hive.Supply = {
      amount: total_vests,
      precision: 6,
      nai: "@@000000037",
    };

    const totalHpAsset = hiveChain.vestsToHp(
      totalVestsSupply,
      rawTotalVestingFundHive,
      rawTotalVestingShares
    );

    const totalHpValue = grabNumericValue(
      hiveChain.formatter.format(totalHpAsset)
    );
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
      totalVestsFormatted: hiveChain.formatter.format(totalVestsSupply),
      totalSavingsHive: totalSavingsHiveValue,
      totalSavingsHbd: totalSavingsHbdValue,
    };
  }, [totalValueLocked, hiveChain, dynamicGlobalData, hivePrice]);

  return (
    <div className="bg-theme rounded mb-2 shadow-md overflow-hidden">
      <CardHeaderWithLink title={t("totalValueLockedCard.totalValueLocked")} />
      <div className="p-3">
        {isTotalValueLockedLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="animate-spin h-5 w-5" />
          </div>
        ) : isTotalValueLockedError ? (
          <p className="text-red-500 text-xs text-center py-4">
            {t("common.errorLoadingData")}
          </p>
        ) : tvlDetails ? (
          <>
            <div className="mb-2.5 flex items-center gap-3 rounded-lg border border-emerald-200/70 bg-emerald-50/60 px-3.5 py-3 dark:border-emerald-500/25 dark:bg-emerald-500/10">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
                <Lock className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700/80 dark:text-emerald-300">
                  {t("totalValueLockedCard.usdValueLocked")}
                </p>
                <p className="text-2xl font-extrabold leading-tight tabular-nums text-explorer-dark-gray dark:text-text">
                  $
                  {tvlDetails.totalUsdValue.toLocaleString(locale, {
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                {
                  accent: "border-indigo-500",
                  label:
                    settings.displayVestHpMode === "hp"
                      ? t("totalValueLockedCard.totalHp")
                      : t("totalValueLockedCard.totalVests"),
                  usd: tvlDetails.totalVestsUsd,
                  sub:
                    settings.displayVestHpMode === "hp"
                      ? `${tvlDetails.totalVests.toLocaleString(locale)} HP`
                      : tvlDetails.totalVestsFormatted,
                },
                {
                  accent: "border-red-500",
                  label: t("totalValueLockedCard.totalHiveSavings"),
                  usd: tvlDetails.totalSavingsHiveUsd,
                  sub: `${tvlDetails.totalSavingsHive.toLocaleString(locale)} HIVE`,
                },
                {
                  accent: "border-blue-500",
                  label: t("totalValueLockedCard.totalHbdSavings"),
                  usd: tvlDetails.totalSavingsHbdUsd,
                  sub: `${tvlDetails.totalSavingsHbd.toLocaleString(locale)} HBD`,
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className={`rounded-lg border-l-2 ${s.accent} bg-explorer-extra-light-gray p-2.5 shadow-sm`}
                >
                  <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {s.label}
                  </p>
                  <p className="text-sm font-bold text-explorer-dark-gray dark:text-text">
                    $
                    {s.usd.toLocaleString(locale, {
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <p className="truncate text-[10px] text-gray-500">{s.sub}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-gray-500 text-sm text-center py-4">
            {t("common.noDataAvailable")}
          </p>
        )}
      </div>
    </div>
  );
};

export default TotalValueLockedCard;
