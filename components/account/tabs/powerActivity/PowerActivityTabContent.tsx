import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { useRouter } from "next/router";
import moment from "moment";
import { Loader2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import useURLParams from "@/hooks/common/useURLParams";
import useAccountVestingStats from "@/hooks/api/accountPage/useAccountVestingStats";
import { useSettings } from "@/contexts/SettingsContext";
import { useTabs } from "@/contexts/TabsContext";
import { useI18n } from "@/i18n/i18n";
import { cn } from "@/lib/utils";
import { trimAccountName } from "@/utils/StringUtils";
import Hive from "@/types/Hive";

import {
  VestingDisplayUnit,
  useAggregatedVesting,
  useVestingDisplayUnit,
} from "@/components/home/hpMomentumUtils";
import PowerActivityTable from "./PowerActivityTable";

import PowerActivitySearch from "./PowerActivitySearch";
import PowerActivityFilterChips from "./PowerActivityFilterChips";
import ActivePowerDownBanner from "./ActivePowerDownBanner";
import PowerActivityKpiStrip from "./PowerActivityKpiStrip";
import HpMomentumChart from "@/components/home/HpMomentumChart";

export interface PowerActivityTabSearchParams {
  accountName?: string;
  vestingFilter: Hive.VestingHistoryFilter;
  granularity: "daily" | "monthly" | "yearly";
  fromBlock: Date | number | undefined;
  toBlock: Date | number | undefined;
  fromDate: Date | undefined;
  toDate: Date | undefined;
  lastBlocks: number | undefined;
  lastTime: number | undefined;
  timeUnit: string | undefined;
  rangeSelectKey: string | undefined;
  page: number | undefined;
}

export const defaultPowerActivityTabSearchParams: PowerActivityTabSearchParams =
  {
    accountName: undefined,
    vestingFilter: "all",
    granularity: "daily",
    fromBlock: undefined,
    toBlock: undefined,
    fromDate: undefined,
    toDate: undefined,
    lastBlocks: undefined,
    lastTime: 30,
    timeUnit: "days",
    // Default the chart/table window to the last 30 days so users land on a
    // useful slice instead of all-time. The chip strip will show "Last 30 days".
    rangeSelectKey: "lastTime",
    page: undefined,
  };

interface PowerActivityTabContentProps {
  isVisible: boolean;
  setIsVisible: Dispatch<SetStateAction<boolean>>;
  setIsFiltersActive: Dispatch<SetStateAction<boolean>>;
  isFiltersActive: boolean;
}

const PowerActivityTabContent: React.FC<PowerActivityTabContentProps> = ({
  isVisible,
  setIsVisible,
  setIsFiltersActive,
}) => {
  const router = useRouter();
  const { t } = useI18n();
  const { activeTab } = useTabs();
  const { settings } = useSettings();

  const { paramsState, setParams } = useURLParams(
    defaultPowerActivityTabSearchParams,
    ["accountName"]
  );

  const accountName = trimAccountName(router.query.accountName as string);
  const isTabActive = activeTab === "power-activity";

  const [unit, setUnit] = useVestingDisplayUnit();

  const [showCustomRange, setShowCustomRange] = useState(false);

  const defaultFromDate = useMemo(
    () => moment().subtract(30, "days").toDate(),
    []
  );

  const {
    fromBlock: fromBlockParam,
    toBlock: toBlockParam,
    fromDate: fromDateParam,
    toDate: toDateParam,
    rangeSelectKey,
  } = paramsState;

  let effectiveFromBlock =
    rangeSelectKey === "none"
      ? undefined
      : fromBlockParam || fromDateParam || defaultFromDate;
  let effectiveToBlock =
    rangeSelectKey === "none" ? undefined : toBlockParam || toDateParam;

  if (
    rangeSelectKey === "lastBlocks" &&
    typeof effectiveFromBlock === "number" &&
    paramsState.lastBlocks
  ) {
    effectiveToBlock = effectiveFromBlock + paramsState.lastBlocks;
  }

  const {
    accountVestingStats,
    isAccountVestingStatsLoading,
    isAccountVestingStatsError,
  } = useAccountVestingStats(
    isTabActive ? accountName : "",
    paramsState.granularity,
    effectiveFromBlock,
    effectiveToBlock,
    "asc",
    settings.liveData
  );

  const { chartData, totals, isReady } = useAggregatedVesting(
    accountVestingStats,
    unit
  );

  const unitOptions: { key: VestingDisplayUnit; label: string }[] = [
    { key: "hp", label: "HP" },
    { key: "vests", label: "VESTS" },
  ];

  const isChartLoading = isAccountVestingStatsLoading || !isReady;
  const hasChartData = chartData.length > 0;

  return (
    <TabsContent value="power-activity">
      <PowerActivityFilterChips
        paramsState={paramsState}
        setParams={setParams}
        onExpand={() => setIsVisible(true)}
        onExpandRanges={() => {
          setIsVisible(true);
          setShowCustomRange(true);
        }}
        isLoading={isAccountVestingStatsLoading}
      />

      <PowerActivitySearch
        paramsState={paramsState}
        setParams={setParams}
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        setIsFiltersActive={setIsFiltersActive}
        showCustomRange={showCustomRange}
        setShowCustomRange={setShowCustomRange}
      />

      <ActivePowerDownBanner accountName={accountName} unit={unit} />

      <PowerActivityKpiStrip totals={totals} unit={unit} />

      <Card
        data-testid="power-activity-chart"
        className="rounded p-2 sm:p-4 mb-4"
      >
        <div className="flex justify-end items-end mb-2 gap-2 flex-wrap">
          <div
            className="inline-flex items-stretch rounded-full border border-navbar-border overflow-hidden text-xs"
            role="group"
            aria-label="HP or VESTS"
          >
            {unitOptions.map((opt, idx) => {
              const isActive = unit === opt.key;
              const isFirst = idx === 0;
              const isLast = idx === unitOptions.length - 1;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setUnit(opt.key)}
                  aria-pressed={isActive}
                  className={cn(
                    "font-medium transition-colors px-3 py-0.5",
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
        </div>

        {isChartLoading ? (
          <div className="flex items-center justify-center h-[300px]">
            <Loader2 className="animate-spin h-6 w-6" />
          </div>
        ) : hasChartData ? (
          <div className="h-[360px] w-full">
            <HpMomentumChart
              data={chartData}
              unit={unit}
              includeBrush
              showYear={paramsState.granularity === "yearly"}
            />
          </div>
        ) : (
          <p className="text-center text-gray-500 text-sm py-10">
            {t("common.noDataAvailable")}
          </p>
        )}
        {isAccountVestingStatsError && (
          <p className="text-red-500 text-xs mt-1">
            {t("common.errorLoadingData")}
          </p>
        )}
      </Card>

      <Card data-testid="power-activity-table" className="rounded p-4">
        <PowerActivityTable
          accountName={accountName}
          filter={paramsState.vestingFilter}
          onFilterChange={(filter) =>
            setParams({
              ...paramsState,
              vestingFilter: filter,
              page: undefined,
            })
          }
          page={paramsState.page}
          onPageChange={(p) => setParams({ ...paramsState, page: p })}
          fromBlock={effectiveFromBlock}
          toBlock={effectiveToBlock}
        />
      </Card>
    </TabsContent>
  );
};

export default PowerActivityTabContent;
