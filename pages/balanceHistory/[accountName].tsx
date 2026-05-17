import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import moment from "moment";
import { config } from "@/Config";

import { Loader2 } from "lucide-react";

import useBalanceHistory from "@/hooks/api/balanceHistory/useBalanceHistory";
import useURLParams from "@/hooks/common/useURLParams";
import useAccountDetails from "@/hooks/api/accountPage/useAccountDetails";

import { convertBalanceHistoryResultsToTableOperations } from "@/lib/utils";
import { getHiveAvatarUrl } from "@/utils/HiveBlogUtils";

import BalanceHistoryTable from "@/components/balanceHistory/BalanceHistoryTable";
import BalanceHistorySearch, {
  DEFAULT_COIN_TYPE,
} from "@/components/home/searches/BalanceHistorySearch";
import ActiveFilterChips from "@/components/balanceHistory/ActiveFilterChips";
import BalanceKpiStrip from "@/components/balanceHistory/BalanceKpiStrip";
import { Card, CardHeader } from "@/components/ui/card";
import BalanceHistoryChart from "@/components/balanceHistory/BalanceHistoryChart";

import ErrorPage from "../ErrorPage";
import NoResult from "@/components/NoResult";
import ScrollTopButton from "@/components/ScrollTopButton";
import useAggregatedBalanceHistory from "@/hooks/api/balanceHistory/useAggregatedHistory";
import PageTitle from "@/components/PageTitle";
import FilterSectionToggle from "@/components/account/FilterSectionToggle";
import { setLocalStorage, getLocalStorage } from "@/utils/LocalStorage";
import { useI18n } from "@/i18n/i18n";
import { useSettings } from "@/contexts/SettingsContext";

export type VestHpUnit = "vests" | "hp";

const MemoizedBalanceHistoryChart = React.memo(BalanceHistoryChart);
const MemoizedBalanceHistoryTable = React.memo(BalanceHistoryTable);

import { prepareBalanceHistoryData } from "@/utils/BalanceHistoryUtils";

export interface Operation {
  timestamp: number;
  balance: number;
  savings_balance?: number; // Optional savings balance
  hivePrice: string;
}

export interface BalanceHistorySearchParams {
  accountName?: string;
  coinType: string;
  fromBlock: Date | number | undefined;
  toBlock: Date | number | undefined;
  fromDate: Date | undefined;
  toDate: Date | undefined;
  lastBlocks: number | undefined;
  lastTime: number | undefined;
  timeUnit: string | undefined;
  rangeSelectKey: string | undefined;
  page: number | undefined;
  filters: boolean[] | undefined;
  includeSavings: string;
}

export const defaultBalanceHistorySearchParams: BalanceHistorySearchParams = {
  accountName: undefined,
  coinType: "HIVE",
  fromBlock: undefined,
  toBlock: undefined,
  fromDate: undefined,
  toDate: undefined,
  lastBlocks: undefined,
  lastTime: 30,
  timeUnit: "days",
  rangeSelectKey: "none",
  page: undefined,
  filters: undefined,
  includeSavings: "yes",
};

export default function BalanceHistory() {
  const router = useRouter();
  const { t } = useI18n();
  const { settings } = useSettings();
  const accountNameFromRoute = (router.query.accountName as string)?.replace(
    "@",
    ""
  );
  const { paramsState, setParams } = useURLParams(
    defaultBalanceHistorySearchParams,
    ["accountName"]
  );

  const [coinType, setCoinType] = useState(
    paramsState.coinType ?? DEFAULT_COIN_TYPE
  );
  const [unit, setUnit] = useState<VestHpUnit>(
    settings.displayVestHpMode === "hp" ? "hp" : "vests"
  );

  useEffect(() => {
    setUnit(settings.displayVestHpMode === "hp" ? "hp" : "vests");
  }, [settings.displayVestHpMode]);
  const initialHasActiveFilters = Boolean(
    (paramsState.filters?.length ?? 0) ||
      paramsState.fromBlock ||
      paramsState.toBlock ||
      paramsState.fromDate ||
      paramsState.toDate ||
      paramsState.coinType !== DEFAULT_COIN_TYPE ||
      paramsState.includeSavings !== "yes"
  );
  const [isFiltersActive, setIsFiltersActive] = useState(
    initialHasActiveFilters
  );
  const [isBalanceFilterSectionVisible, setIsBalanceFilterSectionVisible] =
    useState(
      initialHasActiveFilters &&
        (getLocalStorage("is_balance_filters_visible", true) ?? false)
    );

  const handleFiltersVisibility = () => {
    setIsBalanceFilterSectionVisible(!isBalanceFilterSectionVisible);
    if (isFiltersActive) {
      setLocalStorage(
        "is_balance_filters_visible",
        !isBalanceFilterSectionVisible
      );
    }
  };

  useEffect(() => {
    if (paramsState.coinType) {
      setCoinType(paramsState.coinType);
    }
  }, [paramsState.coinType]);

  const {
    filters: filtersParam,
    fromBlock: fromBlockParam,
    toBlock: toBlockParam,
    fromDate: fromDateParam,
    toDate: toDateParam,
    lastBlocks: lastBlocksParam,
    timeUnit: timeUnitParam,
    lastTime: lastTimeParam,
    rangeSelectKey,
    page,
    includeSavings,
  } = paramsState;

  const defaultFromDate = React.useMemo(
    () => moment().subtract(1, "month").toDate(),
    []
  );

  let effectiveFromBlock =
    paramsState.rangeSelectKey === "none"
      ? undefined
      : paramsState.fromBlock || fromDateParam || defaultFromDate;
  let effectiveToBlock =
    paramsState.rangeSelectKey === "none"
      ? undefined
      : paramsState.toBlock || toDateParam;

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
    isAccountBalanceHistoryError,
  } = useBalanceHistory(
    accountNameFromRoute,
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
    isAggregatedAccountBalanceHistoryError: isChartDataError,
  } = useAggregatedBalanceHistory(
    accountNameFromRoute,
    paramsState.coinType,
    "daily",
    "asc",
    effectiveFromBlock,
    effectiveToBlock
  );

  const preparedData = useMemo(() => {
    return chartData ? prepareBalanceHistoryData(chartData) : [];
  }, [chartData]);

  const tableOperations = useMemo(
    () => convertBalanceHistoryResultsToTableOperations(accountBalanceHistory ?? []),
    [accountBalanceHistory]
  );

  const routeAccountName = Array.isArray(router.query.accountName)
    ? router.query.accountName[0]
    : router.query.accountName;

  if (routeAccountName && !routeAccountName.startsWith("@")) {
    const accountNotFoundError = `${routeAccountName} : ${t(
      "accountName.accountNotFound"
    )}`;
    return <ErrorPage errorMessage={accountNotFoundError} />;
  }
  if (!accountNameFromRoute) {
    return (
      <>
        <Head>
          <title>{t("balanceHistoryPage.loadingTitle")}</title>
        </Head>
        <div className="flex justify-center text-center items-center">
          <Loader2 className="animate-spin mt-1 text-black h-12 w-12 ml-3" />
        </div>
      </>
    );
  }

  const isChartLoading = isChartDataFetching || isChartDataLoading;

  const isAccHistDataLoading =
    isAccountBalanceHistoryLoading || isAccountBalanceHistoryFetching;

  return (
    <>
      <Head>
        <title>@{accountNameFromRoute} Balance History - Hive Explorer</title>
      </Head>

      <div className="page-container">
        <Card data-testid="account-details">
          <CardHeader className="pb-0">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-theme dark:bg-theme">
              <div className="flex flex-col items-start w-full">
                <div className="flex items-start justify-between w-full">
                  <div className="flex items-center gap-2">
                    <div className="flex items-start gap-2">
                      <Image
                        className="rounded-full border-2 border-explorer-orange mt-1"
                        src={getHiveAvatarUrl(accountNameFromRoute)}
                        alt={`${accountNameFromRoute} avatar`}
                        width={50}
                        height={50}
                        data-testid="user-avatar"
                      />
                      <div>
                        <h2
                          className="flex items-start"
                          data-testid="account-name"
                        >
                          <Link
                            className="text-link text-lg font-semibold text-gray-800 dark:text-white mt-4"
                            href={`/@${accountNameFromRoute}`}
                          >
                            {accountNameFromRoute}
                          </Link>
                          <span className="hidden md:inline mx-1 text-gray-800 dark:text-white mt-4 text-xl">
                            |
                          </span>
                          <div className="hidden md:inline">
                            <PageTitle
                              titleKey="pageTitle.balanceHistory"
                              className="py-4 pr-1 mt-[2px]"
                            />
                          </div>
                        </h2>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 md:mt-2">
                    <FilterSectionToggle
                      isFiltersActive={isFiltersActive}
                      toggleFilters={handleFiltersVisibility}
                    />
                  </div>
                </div>
                <div className="md:hidden ml-14 ">
                  <PageTitle
                    titleKey="pageTitle.balanceHistory"
                    className="py-1 pr-1 mt-0 min-h-min"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <ActiveFilterChips
          paramsState={paramsState}
          setParams={setParams}
          coinType={coinType}
          setCoinType={setCoinType}
          unit={unit}
          setUnit={setUnit}
          settingsDisplayMode={settings.displayVestHpMode}
        />

        <BalanceHistorySearch
          paramsState={paramsState}
          setParams={setParams}
          isVisible={isBalanceFilterSectionVisible}
          setIsVisible={setIsBalanceFilterSectionVisible}
          setIsFiltersActive={setIsFiltersActive}
          isFiltersActive={isFiltersActive}
          coinType={coinType}
          setCoinType={setCoinType}
          unit={unit}
          setUnit={setUnit}
        />
        {(isChartLoading || isAccHistDataLoading) && !chartData ? (
          <div className="flex justify-center text-center align-center items-center mb-5">
            <Loader2 className="animate-spin h-12 w-12" />
          </div>
        ) : (
          <>
            <Card
              data-testid="account-details"
              className="rounded"
            >
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
            <MemoizedBalanceHistoryTable
              operations={tableOperations}
              total_operations={accountBalanceHistory.total_operations ?? 0}
              total_pages={accountBalanceHistory.total_pages ?? 0}
              current_page={
                paramsState.page ?? accountBalanceHistory.total_pages
              }
              account_name={accountNameFromRoute ?? ""}
              unit={unit}
            />
          </>
        )}

        <div className="fixed bottom-[10px] right-0 flex flex-col items-end justify-end px-3 md:px-12">
          <ScrollTopButton />
        </div>
      </div>
    </>
  );
}
