import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Loader2 } from "lucide-react";
import moment from "moment";
import React from "react";

import { config } from "@/Config";
import { TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import NoResult from "@/components/NoResult";

import useBalanceHistory from "@/hooks/api/balanceHistory/useBalanceHistory";
import useAggregatedBalanceHistory from "@/hooks/api/balanceHistory/useAggregatedHistory";
import useURLParams from "@/hooks/common/useURLParams";
import { useTabs } from "@/contexts/TabsContext";
import { useSettings } from "@/contexts/SettingsContext";

import BalanceHistoryTable from "./BalanceHistoryTable";
import BalanceHistorySearch, {
  DEFAULT_COIN_TYPE,
} from "@/components/home/searches/BalanceHistorySearch";
import ActiveFilterChips from "./ActiveFilterChips";
import BalanceKpiStrip from "./BalanceKpiStrip";
import BalanceHistoryChart from "@/components/balanceHistory/BalanceHistoryChart";
import { convertBalanceHistoryResultsToTableOperations } from "@/lib/utils";
import { prepareBalanceHistoryData } from "@/utils/BalanceHistoryUtils";
import { getLocalStorage } from "@/utils/LocalStorage";
import { trimAccountName } from "@/utils/StringUtils";
import {
  VestHpUnit,
  defaultBalanceHistorySearchParams,
} from "./balanceHistoryParams";

const MemoizedBalanceHistoryChart = React.memo(BalanceHistoryChart);
const MemoizedBalanceHistoryTable = React.memo(BalanceHistoryTable);

interface BalanceHistoryTabContentProps {
  isVisible: boolean;
  setIsVisible: Dispatch<SetStateAction<boolean>>;
  setIsFiltersActive: Dispatch<SetStateAction<boolean>>;
  isFiltersActive: boolean;
}

const BalanceHistoryTabContent: React.FC<BalanceHistoryTabContentProps> = ({
  isVisible,
  setIsVisible,
  setIsFiltersActive,
}) => {
  const router = useRouter();
  const { activeTab } = useTabs();
  const { settings } = useSettings();
  const { paramsState, setParams } = useURLParams(
    defaultBalanceHistorySearchParams,
    ["accountName"]
  );

  const accountName = trimAccountName(router.query.accountName as string);

  const isTabActive = activeTab === "balance-history";

  const [coinType, setCoinType] = useState(
    paramsState.coinType ?? DEFAULT_COIN_TYPE
  );
  const [unit, setUnit] = useState<VestHpUnit>(
    settings.displayVestHpMode === "hp" ? "hp" : "vests"
  );

  useEffect(() => {
    setUnit(settings.displayVestHpMode === "hp" ? "hp" : "vests");
  }, [settings.displayVestHpMode]);

  useEffect(() => {
    if (paramsState.coinType) setCoinType(paramsState.coinType);
  }, [paramsState.coinType]);

  const [showCustomRange, setShowCustomRange] = useState(false);

  const {
    fromBlock: fromBlockParam,
    toBlock: toBlockParam,
    fromDate: fromDateParam,
    toDate: toDateParam,
    rangeSelectKey,
    includeSavings,
  } = paramsState;

  const defaultFromDate = useMemo(
    () => moment().subtract(1, "month").toDate(),
    []
  );

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
    accountBalanceHistory,
    isAccountBalanceHistoryLoading,
    isAccountBalanceHistoryFetching,
  } = useBalanceHistory(
    isTabActive ? accountName : "",
    paramsState.coinType,
    paramsState.page,
    config.standardPaginationSize,
    "desc",
    effectiveFromBlock,
    effectiveToBlock
  );

  const {
    aggregatedAccountBalanceHistory: chartData,
    isAggregatedAccountBalanceHistoryLoading: isChartDataLoading,
    isAggregatedAccountBalanceHistoryFetching: isChartDataFetching,
  } = useAggregatedBalanceHistory(
    isTabActive ? accountName : "",
    paramsState.coinType,
    "daily",
    "asc",
    effectiveFromBlock,
    effectiveToBlock
  );

  const preparedData = useMemo(
    () => (chartData ? prepareBalanceHistoryData(chartData) : []),
    [chartData]
  );

  const tableOperations = useMemo(
    () =>
      convertBalanceHistoryResultsToTableOperations(
        accountBalanceHistory ?? []
      ),
    [accountBalanceHistory]
  );

  const hasActiveFilters = Boolean(
    (paramsState.filters?.length ?? 0) ||
    paramsState.fromBlock ||
    paramsState.toBlock ||
    paramsState.fromDate ||
    paramsState.toDate ||
    paramsState.coinType !== DEFAULT_COIN_TYPE ||
    paramsState.includeSavings !== "yes"
  );

  useEffect(() => {
    if (!isTabActive) return;
    setIsFiltersActive(hasActiveFilters);
    if (hasActiveFilters) {
      const persisted = getLocalStorage("is_balance_filters_visible", true);
      setIsVisible(persisted);
    } else {
      setIsVisible(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasActiveFilters, isTabActive]);

  const isChartLoading = isChartDataFetching || isChartDataLoading;
  const isAccHistDataLoading =
    isAccountBalanceHistoryLoading || isAccountBalanceHistoryFetching;

  return (
    <TabsContent value="balance-history">
      <ActiveFilterChips
        paramsState={paramsState as any}
        setParams={setParams as any}
        coinType={coinType}
        setCoinType={setCoinType}
        unit={unit}
        setUnit={setUnit}
        settingsDisplayMode={settings.displayVestHpMode}
        onExpand={() => setIsVisible(true)}
        onExpandRanges={() => {
          setIsVisible(true);
          setShowCustomRange(true);
        }}
        isLoading={isChartDataFetching || isAccountBalanceHistoryFetching}
      />

      <BalanceHistorySearch
        paramsState={paramsState}
        setParams={setParams}
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        setIsFiltersActive={setIsFiltersActive}
        coinType={coinType}
        setCoinType={setCoinType}
        unit={unit}
        setUnit={setUnit}
        showCustomRange={showCustomRange}
        setShowCustomRange={setShowCustomRange}
      />

      {(isChartLoading || isAccHistDataLoading) && !chartData ? (
        <div className="flex justify-center text-center align-center items-center mb-5">
          <Loader2 className="animate-spin h-12 w-12" />
        </div>
      ) : (
        <>
          <Card data-testid="balance-history-content" className="rounded">
            {!isChartLoading && (!chartData || chartData.length === 0) ? (
              <NoResult titleKey="noResult.noChartData" />
            ) : (
              <>
                <BalanceKpiStrip
                  data={preparedData}
                  coinType={coinType}
                  unit={unit}
                />
                <MemoizedBalanceHistoryChart
                  aggregatedAccountBalanceHistory={preparedData}
                  selectedCoinType={coinType}
                  setSelectedCoinType={setCoinType}
                  showSavingsBalance={includeSavings}
                  unit={unit}
                  setUnit={setUnit}
                  className="h-[450px] mb-10 mr-0 pr-1 pb-6"
                />
              </>
            )}
          </Card>
          {accountBalanceHistory && (
            <MemoizedBalanceHistoryTable
              operations={tableOperations}
              total_operations={accountBalanceHistory.total_operations ?? 0}
              total_pages={accountBalanceHistory.total_pages ?? 0}
              current_page={
                paramsState.page ?? accountBalanceHistory.total_pages
              }
              account_name={accountName ?? ""}
              unit={unit}
            />
          )}
        </>
      )}
    </TabsContent>
  );
};

export default BalanceHistoryTabContent;
