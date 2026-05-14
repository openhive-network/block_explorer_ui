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
import { Card, CardHeader } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import BalanceHistoryChart from "@/components/balanceHistory/BalanceHistoryChart";
import PowerActivityTable from "@/components/balanceHistory/PowerActivityTable";
import Hive from "@/types/Hive";

import ErrorPage from "../ErrorPage";
import NoResult from "@/components/NoResult";
import ScrollTopButton from "@/components/ScrollTopButton";
import useAggregatedBalanceHistory from "@/hooks/api/balanceHistory/useAggregatedHistory";
import PageTitle from "@/components/PageTitle";
import FilterSectionToggle from "@/components/account/FilterSectionToggle";
import { setLocalStorage, getLocalStorage } from "@/utils/LocalStorage";
import { useI18n } from "@/i18n/i18n";

const MemoizedBalanceHistoryChart = React.memo(BalanceHistoryChart);

export interface Operation {
  timestamp: number;
  balance: number;
  savings_balance?: number; // Optional savings balance
  hivePrice: string;
}

interface BalanceHistorySearchParams {
  accountName?: string;
  coinType: string;
  fromBlock: Date | number | undefined;
  toBlock: Date | number | undefined;
  fromDate: undefined;
  toDate: undefined;
  lastBlocks: number | undefined;
  lastTime: number | undefined;
  timeUnit: string | undefined;
  rangeSelectKey: string | undefined;
  page: number | undefined;
  filters: boolean[] | undefined;
  includeSavings: string;
  view: "balance" | "power";
  vestingFilter: Hive.VestingHistoryFilter;
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
  view: "balance",
  vestingFilter: "all",
};

const prepareData = (operations: Operation[]) => {
  if (!operations || operations.length === 0) return [];

  const aggregatedData = new Map<
    string,
    {
      balance: number;
      balance_change: number;
      savings_balance: number | undefined;
      savings_balance_change: number | undefined;
      hivePrice: string;
    }
  >();

  operations?.forEach((operation: any) => {
    let balance_change =
      operation.balance.balance - operation.prev_balance.balance;
    let balance = parseInt(operation.balance.balance, 10);
    let savings_balance = operation.balance.savings_balance
      ? parseInt(operation.balance.savings_balance, 10)
      : undefined;
    let savings_balance_change =
      operation.balance.savings_balance -
      operation.prev_balance.savings_balance;
    let hivePrice = operation.hivePrice;

    aggregatedData.set(operation.date, {
      balance,
      balance_change,
      savings_balance,
      savings_balance_change,
      hivePrice,
    });
  });

  const preparedData = Array.from(aggregatedData.entries()).map(
    ([date, data]) => ({
      timestamp: date,
      balance: data.balance,
      balance_change: data.balance_change,
      savings_balance: data.savings_balance,
      savings_balance_change: data.savings_balance_change,
      hivePrice: data.hivePrice,
    })
  );

  return preparedData;
};

export default function BalanceHistory() {
  const router = useRouter();
  const { t } = useI18n();
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
  // Initialize state variables outside the conditional block
  const [isFiltersActive, setIsFiltersActive] = useState(false);
  const [isBalanceFilterSectionVisible, setIsBalanceFilterSectionVisible] =
    useState(getLocalStorage("is_balance_filters_visible", true) ?? false);

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
    return chartData ? prepareData(chartData) : [];
  }, [chartData]);

  let message = "";
  if (
    effectiveFromBlock === defaultFromDate &&
    !fromBlockParam &&
    !toBlockParam
  ) {
    message = t("balanceHistoryPage.showingResultsLastMonth");
  } else {
    message = t("balanceHistoryPage.showingResultsAppliedFilters");
  }

  const routeAccountName = Array.isArray(router.query.accountName)
    ? router.query.accountName[0]
    : router.query.accountName;

  if (routeAccountName && !routeAccountName.startsWith("@")) {
    const accountNotFoundError = `${routeAccountName} : ${t(
      "accountName.accountNotFound"
    )}`;
    return <ErrorPage errorMessage={accountNotFoundError} />;
  }
  // Return early with a loading state if accountNameFromRoute is not yet available
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
        <title>@{accountNameFromRoute} - Hive Explorer</title>
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
                        alt="avatar"
                        width={50}
                        height={50}
                        data-testid="user-avatar"
                      />
                      <div>
                        <h2
                          className=" flex items-start"
                          data-testid="account-name"
                        >
                          <Link
                            className="text-link text-lg font-semibold text-gray-800 dark:text-white mt-4 "
                            href={`/@${accountNameFromRoute}`}
                          >
                            {accountNameFromRoute}
                          </Link>
                          <span className="hidden md:inline mx-1 text-gray-800 dark:text-white mt-4 text-xl">
                            |
                          </span>
                          <div className="hidden md:inline ">
                            <PageTitle
                              titleKey="pageTitle.balanceHistory"
                              className=" py-4 pr-1 mt-[2px]"
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

        <BalanceHistorySearch
          paramsState={paramsState}
          setParams={setParams}
          isVisible={isBalanceFilterSectionVisible}
          setIsVisible={setIsBalanceFilterSectionVisible}
          setIsFiltersActive={setIsFiltersActive}
          isFiltersActive={isFiltersActive}
          coinType={coinType}
          setCoinType={setCoinType}
        />
        <Tabs
          value={paramsState.view}
          onValueChange={(value) =>
            setParams({
              ...paramsState,
              view: value as "balance" | "power",
              page: undefined,
            })
          }
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 max-w-md mb-3">
            <TabsTrigger value="balance">
              {t("balanceHistoryPage.tabBalance")}
            </TabsTrigger>
            <TabsTrigger value="power">
              {t("balanceHistoryPage.tabPowerActivity")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="balance">
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
                  <>
                    {message &&
                      !isChartLoading &&
                      chartData &&
                      chartData.length && (
                        <div className="rounded p-4 bg-gray-100 dark:bg-gray-700 mb-4 text-center text-sm text-gray-500">
                          {message}
                          <br />
                        </div>
                      )}
                    <MemoizedBalanceHistoryChart
                      aggregatedAccountBalanceHistory={preparedData}
                      selectedCoinType={coinType}
                      setSelectedCoinType={setCoinType}
                      showSavingsBalance={includeSavings}
                      className="h-[450px] mb-10 mr-0 pr-1 pb-6"
                    />
                  </>

                  {(!isChartLoading && !chartData) ||
                    (!isChartLoading && chartData?.length === 0 && (
                      <NoResult titleKey="noResult.noChartData" />
                    ))}
                </Card>
                <BalanceHistoryTable
                  operations={convertBalanceHistoryResultsToTableOperations(
                    accountBalanceHistory ?? []
                  )}
                  total_operations={accountBalanceHistory.total_operations ?? []}
                  total_pages={accountBalanceHistory.total_pages ?? 0}
                  current_page={
                    paramsState.page ?? accountBalanceHistory.total_pages
                  }
                  account_name={accountNameFromRoute ?? ""}
                />
              </>
            )}
          </TabsContent>

          <TabsContent value="power">
            <Card
              data-testid="power-activity"
              className="rounded p-4"
            >
              <PowerActivityTable
                accountName={accountNameFromRoute}
                filter={paramsState.vestingFilter}
                onFilterChange={(filter) =>
                  setParams({
                    ...paramsState,
                    vestingFilter: filter,
                    page: undefined,
                  })
                }
                page={paramsState.page}
                onPageChange={(p) =>
                  setParams({ ...paramsState, page: p })
                }
                fromBlock={effectiveFromBlock}
                toBlock={effectiveToBlock}
              />
            </Card>
          </TabsContent>
        </Tabs>

        <div className="fixed bottom-[10px] right-0 flex flex-col items-end justify-end px-3 md:px-12">
          <ScrollTopButton />
        </div>
      </div>
    </>
  );
}
