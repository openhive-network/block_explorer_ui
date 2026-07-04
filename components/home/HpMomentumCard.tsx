import React, { useMemo, useState } from "react";
import { Loader2, TrendingDown, TrendingUp } from "lucide-react";
import dynamic from "next/dynamic";

import useVestingStats from "@/hooks/api/homePage/useVestingStats";
import { useSettings } from "@/contexts/SettingsContext";
import { useI18n } from "../../i18n/i18n";
import SegmentedToggle from "@/components/ui/SegmentedToggle";
import CardHeaderWithLink from "@/components/ui/CardHeaderWithLink";
import {
  VestingDisplayUnit,
  formatCompact,
  useAggregatedVesting,
  useVestingDisplayUnit,
} from "./hpMomentumUtils";

import HpMomentumChart from "./HpMomentumChart";
const HpMomentumFullChartDialog = dynamic(
  () => import("./HpMomentumFullChartDialog"),
  { ssr: false }
);

const HpMomentumCard = () => {
  const { t, locale } = useI18n();
  const { settings } = useSettings();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [unit, setUnit] = useVestingDisplayUnit();

  const fromDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d;
  }, []);

  const { vestingStats, isVestingStatsLoading, isVestingStatsError } =
    useVestingStats("daily", "asc", fromDate, undefined, settings.liveData);

  const { chartData, totals, isReady } = useAggregatedVesting(
    vestingStats,
    unit
  );

  const isLoading = isVestingStatsLoading || !isReady;
  const hasData = chartData.length > 0;
  const netIsPositive = totals.net >= 0;
  const unitLabel = unit === "hp" ? "HP" : "VESTS";

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const unitOptions: { key: VestingDisplayUnit; label: string }[] = [
    { key: "hp", label: "HP" },
    { key: "vests", label: "VESTS" },
  ];

  const breakdownRows: {
    label: string;
    value: number;
    count: number;
    color: string;
    sign: "+" | "-" | "";
  }[] = [
    {
      label: t("hpMomentumCard.poweredUp"),
      value: totals.up,
      count: totals.upCount,
      color: "text-emerald-500",
      sign: "+",
    },
    {
      label: t("hpMomentumCard.scheduledDown"),
      value: totals.downInit,
      count: totals.downInitCount,
      color: "text-amber-500",
      sign: "",
    },
    {
      label: t("hpMomentumCard.poweredDown"),
      value: totals.downFill,
      count: totals.downFillCount,
      color: "text-rose-500",
      sign: "-",
    },
  ];

  return (
    <div className="bg-theme rounded mb-2 shadow-md overflow-hidden">
      <CardHeaderWithLink
        title={t("widgets.hpMomentumName")}
        actions={
          <>
            <SegmentedToggle
              ariaLabel="HP or VESTS"
              value={unit}
              onChange={setUnit}
              options={unitOptions.map((o) => ({
                value: o.key,
                label: o.label,
              }))}
            />
            <button
              onClick={openModal}
              className="text-[13px] underline text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              {t("common.fullChart")}
            </button>
          </>
        }
      />
      <div className="flex flex-wrap gap-3 p-3">
        {/* Left: Net flow + breakdown */}
        <div className="flex-1 min-w-[200px]">
          <div className="flex flex-col gap-3 h-full">
            <div className="bg-explorer-extra-light-gray rounded-lg p-3 shadow-md">
              <h3 className="text-sm font-semibold uppercase tracking-wide mb-1 text-explorer-dark-gray dark:text-text">
                {t("hpMomentumCard.netFlow30d", { unit: unitLabel })}
              </h3>
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="animate-spin h-5 w-5" />
                </div>
              ) : hasData ? (
                <div className="flex items-center justify-end gap-1 whitespace-nowrap">
                  {netIsPositive ? (
                    <TrendingUp className="h-4 w-4" color="#10B981" />
                  ) : (
                    <TrendingDown className="h-4 w-4" color="#EF4444" />
                  )}
                  <p
                    className={`text-lg font-bold text-right ${
                      netIsPositive ? "text-emerald-500" : "text-rose-500"
                    }`}
                    title={`${
                      netIsPositive ? "+" : ""
                    }${totals.net.toLocaleString(locale)} ${unitLabel}`}
                  >
                    {netIsPositive ? "+" : ""}
                    {formatCompact(totals.net, locale)}{" "}
                    <span className="text-base">{unitLabel}</span>
                  </p>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  {t("common.noDataAvailable")}
                </p>
              )}
            </div>

            <div className="bg-explorer-extra-light-gray rounded-lg p-3 shadow-md flex-1 flex flex-col">
              <h3 className="text-sm font-semibold uppercase tracking-wide mb-2 text-explorer-dark-gray dark:text-text">
                {t("hpMomentumCard.breakdown")}
              </h3>
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="animate-spin h-5 w-5" />
                </div>
              ) : hasData ? (
                <div className="flex flex-col gap-2.5">
                  {breakdownRows.map((row) => (
                    <div
                      key={row.label}
                      className="flex flex-col leading-tight"
                    >
                      <span className="text-xs text-gray-500">{row.label}</span>
                      <div className="flex justify-between items-baseline gap-2">
                        <span
                          className={`text-sm font-semibold whitespace-nowrap ${row.color}`}
                          title={`${row.sign}${row.value.toLocaleString(locale)} ${unitLabel}`}
                        >
                          {row.sign}
                          {formatCompact(row.value, locale)} {unitLabel}
                        </span>
                        <span className="text-[10px] text-gray-400 whitespace-nowrap">
                          {row.count.toLocaleString(locale)}{" "}
                          {t("hpMomentumCard.ops")}
                        </span>
                      </div>
                    </div>
                  ))}
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
        <div className="flex-[2] min-w-[260px]">
          <div className="bg-explorer-extra-light-gray rounded-lg p-3 shadow-md h-full flex flex-col">
            <h3 className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">
              {t("hpMomentumCard.last30Days")}
            </h3>
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin h-6 w-6" />
              </div>
            ) : (
              <div className="flex-grow min-h-[240px]">
                <HpMomentumChart
                  data={chartData}
                  unit={unit}
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

      <HpMomentumFullChartDialog isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
};

export default HpMomentumCard;
