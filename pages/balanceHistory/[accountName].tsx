import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import moment from "moment";
import { config } from "@/Config";

import { Loader2 } from "lucide-react";

import useBalanceHistory from "@/hooks/api/balanceHistory/useBalanceHistory";
import useURLParams from "@/hooks/common/useURLParams";
import useAccountDetails from "@/hooks/api/accountPage/useAccountDetails";

import { convertBalanceHistoryResultsToTableOperations } from "@/lib/utils";
import { getHiveAvatarUrl } from "@/utils/HiveBlogUtils";

import BalanceHistoryTable from "@/components/balanceHistory/BalanceHistoryTable";
import BalanceHistorySearch from "@/components/home/searches/BalanceHistorySearch";
import { Card, CardHeader } from "@/components/ui/card";
import BalanceHistoryChart from "@/components/balanceHistory/BalanceHistoryChart";

import ErrorPage from "../ErrorPage";
import NoResult from "@/components/NoResult";
import ScrollTopButton from "@/components/ScrollTopButton";
import useAggregatedBalanceHistory from "@/hooks/api/balanceHistory/useAggregatedHistory";
import PageTitle from "@/components/PageTitle";
import FilterSectionToggle from "@/components/account/FilterSectionToggle";
import { setLocalStorage, getLocalStorage } from "@/utils/LocalStorage";

const MemoizedBalanceHistoryChart = React.memo(BalanceHistoryChart);

interface Operation {
  timestamp: number;
  balance: number;
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
};

const prepareData = (operations: Operation[]) => {
  if (!operations || operations.length === 0) return [];

  const aggregatedData = new Map<
    string,
    { balance: number; balance_change: number }
  >();

  operations.forEach((operation: any) => {
    let balance_change = operation.balance - operation.prev_balance;
    let balance = parseInt(operation.balance, 10);

    aggregatedData.set(operation.date, { balance, balance_change });
  });

  const preparedData = Array.from(aggregatedData.entries()).map(
    ([date, data]) => ({
      timestamp: date,
      balance: data.balance,
      balance_change: data.balance_change,
    })
  );
  return preparedData;
};

export default function BalanceHistory() {
  const router = useRouter();
  const accountNameFromRoute = (router.query.accountName as string)?.replace(
    "@",
    ""
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

  const {
    accountDetails,
    isAccountDetailsLoading,
    isAccountDetailsError,
    notFound,
  } = useAccountDetails(accountNameFromRoute, false);

  const { paramsState, setParams } = useURLParams(
    defaultBalanceHistorySearchParams,
    ["accountName"]
  );

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
    message = "Showing Results for the last month.";
  } else {
    message = "Showing Results with applied filters.";
  }

  const routeAccountName = Array.isArray(router.query.accountName)
    ? router.query.accountName[0]
    : router.query.accountName;

  if (routeAccountName && !routeAccountName.startsWith("@")) {
    return <ErrorPage />;
  }

  // Return early with a loading state if accountNameFromRoute is not yet available
  if (!accountNameFromRoute) {
    return (
      <>
        <Head>
          <title>Loading...</title>
        </Head>
        <div className="flex justify-center text-center items-center">
          <Loader2 className="animate-spin mt-1 text-black h-12 w-12 ml-3" />
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>@{accountNameFromRoute} - Hive Explorer</title>
      </Head>

      {isAccountDetailsLoading ? (
        <div className="flex justify-center text-center items-center">
          <Loader2 className="animate-spin mt-1 text-black h-12 w-12 ml-3" />
        </div>
      ) : notFound ? (
        <div>Account not found</div>
      ) : (
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
                                title="Balance History"
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
                      title="Balance History"
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
          />

          <Card
            data-testid="account-details"
            className="rounded"
          >
            {message && (
              <div className="rounded p-4 bg-gray-100 dark:bg-gray-700 mb-4 text-center text-sm text-gray-500">
                {message}
                <br />
              </div>
            )}

            {isChartDataLoading ? (
              <div className="flex justify-center text-center items-center">
                <Loader2 className="animate-spin mt-1 h-16 w-10 ml-10 dark:text-white" />
              </div>
            ) : isChartDataError ? (
              <div className="text-center">Error loading chart data</div>
            ) : preparedData.length > 0 ? (
              <MemoizedBalanceHistoryChart
                hiveBalanceHistoryData={
                  !paramsState.coinType || paramsState.coinType === "HIVE"
                    ? preparedData
                    : undefined
                }
                vestsBalanceHistoryData={
                  paramsState.coinType === "VESTS" ? preparedData : undefined
                }
                hbdBalanceHistoryData={
                  paramsState.coinType === "HBD" ? preparedData : undefined
                }
                quickView={false}
                className="h-[450px] mb-10 mr-0 pr-1 pb-6"
              />
            ) : (
              <NoResult title="No chart data available" />
            )}
          </Card>

          {isAccountBalanceHistoryLoading ? (
            <div className="flex justify-center text-center items-center">
              <Loader2 className="animate-spin mt-1 h-12 w-12 ml-3" />
            </div>
          ) : accountBalanceHistory?.total_operations ? (
            <BalanceHistoryTable
              operations={convertBalanceHistoryResultsToTableOperations(
                accountBalanceHistory
              )}
              total_operations={accountBalanceHistory.total_operations}
              total_pages={accountBalanceHistory.total_pages}
              current_page={paramsState.page ?? 1}
              account_name={accountNameFromRoute}
            />
          ) : (
            <NoResult title="No transaction data available" />
          )}

          <div className="fixed bottom-[10px] right-0 flex flex-col items-end justify-end px-3 md:px-12">
            <ScrollTopButton />
          </div>
        </div>
      )}
    </>
  );
}
