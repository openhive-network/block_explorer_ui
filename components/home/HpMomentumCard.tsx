import React, { useMemo } from "react";
import { Loader2, TrendingDown, TrendingUp } from "lucide-react";

import useVestingStats from "@/hooks/api/homePage/useVestingStats";
import useDynamicGlobal from "@/hooks/api/homePage/useDynamicGlobal";
import { useHeadBlockNumber } from "@/contexts/HeadBlockContext";
import { useHiveChainContext } from "@/contexts/HiveChainContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useI18n } from "../../i18n/i18n";
import Hive from "@/types/Hive";
import { grabNumericValue } from "@/utils/StringUtils";

import HpMomentumChart, { HpMomentumChartPoint } from "./HpMomentumChart";

const HpMomentumCard = () => {
  const { t } = useI18n();
  const { settings } = useSettings();
  const { hiveChain } = useHiveChainContext();
  const { headBlockNumberData } = useHeadBlockNumber();
  const { dynamicGlobalData } = useDynamicGlobal(headBlockNumberData);

  const fromDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d;
  }, []);

  const {
    vestingStats,
    isVestingStatsLoading,
    isVestingStatsError,
  } = useVestingStats("daily", "asc", fromDate, undefined, settings.liveData);

  const vestsToHpNumber = useMemo(() => {
    if (!hiveChain || !dynamicGlobalData) return null;
    const { rawTotalVestingFundHive, rawTotalVestingShares } =
      dynamicGlobalData.headBlockDetails;
    return (vests: Hive.Supply | null | undefined): number => {
      if (!vests || !vests.amount || vests.amount === "0") return 0;
      const hpAsset = hiveChain.vestsToHp(
        vests,
        rawTotalVestingFundHive,
        rawTotalVestingShares
      );
      return grabNumericValue(hiveChain.formatter.format(hpAsset));
    };
  }, [hiveChain, dynamicGlobalData]);

  const { chartData, totals } = useMemo(() => {
    if (!vestingStats || !vestsToHpNumber) {
      return {
        chartData: [] as HpMomentumChartPoint[],
        totals: { up: 0, down: 0, net: 0 },
      };
    }

    let upTotal = 0;
    let downTotal = 0;
    const points: HpMomentumChartPoint[] = vestingStats.map((row) => {
      const up = vestsToHpNumber(row.power_up_vests);
      const down = vestsToHpNumber(row.power_down_fill_vests);
      upTotal += up;
      downTotal += down;
      return {
        date: row.date,
        power_up_hp: up,
        power_down_hp: down,
        net_hp: up - down,
      };
    });

    return {
      chartData: points,
      totals: { up: upTotal, down: downTotal, net: upTotal - downTotal },
    };
  }, [vestingStats, vestsToHpNumber]);

  const isLoading = isVestingStatsLoading || !vestsToHpNumber;
  const hasData = chartData.length > 0;
  const netIsPositive = totals.net >= 0;

  return (
    <div className="bg-theme rounded mt-4 shadow-md overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5">
        {/* Left: Net flow + breakdown */}
        <div className="md:col-span-1">
          <div className="flex flex-col space-y-4">
            <div className="bg-explorer-extra-light-gray rounded-lg p-4 shadow-md">
              <h3 className="text-sm font-semibold uppercase tracking-wide mb-1 text-explorer-dark-gray dark:text-text">
                {t("hpMomentumCard.netFlow30d")}
              </h3>
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="animate-spin h-5 w-5" />
                </div>
              ) : hasData ? (
                <div className="flex items-center justify-end gap-1">
                  {netIsPositive ? (
                    <TrendingUp className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-rose-500" />
                  )}
                  <p
                    className={`text-2xl font-bold text-right ${
                      netIsPositive ? "text-emerald-500" : "text-rose-500"
                    }`}
                  >
                    {netIsPositive ? "+" : ""}
                    {totals.net.toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}{" "}
                    HP
                  </p>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  {t("common.noDataAvailable")}
                </p>
              )}
            </div>

            <div className="bg-explorer-extra-light-gray rounded-lg p-4 shadow-md">
              <h3 className="text-sm font-semibold uppercase tracking-wide mb-1 text-explorer-dark-gray dark:text-text">
                {t("hpMomentumCard.breakdown")}
              </h3>
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="animate-spin h-5 w-5" />
                </div>
              ) : hasData ? (
                <div className="flex flex-col gap-1 mt-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">
                      {t("hpMomentumCard.poweredUp")}:
                    </span>
                    <span className="font-medium text-emerald-500 text-right">
                      +
                      {totals.up.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}{" "}
                      HP
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">
                      {t("hpMomentumCard.poweredDown")}:
                    </span>
                    <span className="font-medium text-rose-500 text-right">
                      -
                      {totals.down.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}{" "}
                      HP
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  {t("common.noDataAvailable")}
                </p>
              )}
              {isVestingStatsError && (
                <p className="text-red-500 text-xs mt-1">
                  {t("common.errorLoadingData")}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right: 30-day trend chart */}
        <div className="md:col-span-2">
          <div className="bg-explorer-extra-light-gray rounded-lg p-4 shadow-md h-full flex flex-col">
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-explorer-dark-gray dark:text-text">
                {t("hpMomentumCard.last30Days")}
              </h3>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin h-6 w-6" />
              </div>
            ) : (
              <div className="flex-grow min-h-[189px]">
                <HpMomentumChart
                  data={chartData}
                  tickCount={4}
                  dateFormat="MMM D"
                />
              </div>
            )}
            {isVestingStatsError && (
              <p className="text-red-500 text-xs mt-1">
                {t("common.errorLoadingData")}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HpMomentumCard;
