import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import React, { useMemo } from "react";
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
// Memoizing the BalanceHistoryChart component to avoid unnecessary re-renders
const MemoizedBalanceHistoryChart = React.memo(BalanceHistoryChart);

interface Operation {
  timestamp: number; // Timestamp in seconds
  balance: number; // Balance associated with the operation
}

const prepareData = (operations: Operation[]) => {
  if (!operations || operations.length === 0) return [];

  const dailyData = new Map<
    string,
    { balance: number; balance_change: number }
  >();

  operations.forEach((operation: any) => {
    let date;
    if (typeof operation.timestamp === "string") {
      date = new Date(operation.timestamp);
    } else if (typeof operation.timestamp === "number") {
      date = new Date(operation.timestamp * 1000);
    } else {
      return;
    }

    if (!isNaN(date.getTime())) {
      const dateString = date.toISOString().split("T")[0];

      let balance_change = parseInt(operation.balance_change, 10);
      let balance = parseInt(operation.balance, 10);

      if (dailyData.has(dateString)) {
        dailyData.get(dateString)!.balance_change += balance_change;
        dailyData.get(dateString)!.balance = balance;
      } else {
        dailyData.set(dateString, { balance, balance_change });
      }
    }
  });

  const preparedData = Array.from(dailyData.entries()).map(([date, data]) => ({
    timestamp: date,
    balance: data.balance,
    balance_change: data.balance_change,
  }));

  return preparedData;
};

export default function BalanceHistory() {
  const router = useRouter();
  const accountNameFromRoute = (router.query.accountName as string)?.replace(
    "@",
    ""
  );

  const {
    accountDetails,
    isAccountDetailsLoading,
    isAccountDetailsError,
    notFound,
  } = useAccountDetails(accountNameFromRoute, false);

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
    page: number;
    filters: boolean[] | undefined;
  }

  const defaultSearchParams: BalanceHistorySearchParams = {
    accountName: accountNameFromRoute,
    coinType: "HIVE",
    fromBlock: undefined,
    toBlock: undefined,
    fromDate: undefined,
    toDate: undefined,
    lastBlocks: undefined,
    lastTime: 30,
    timeUnit: "days",
    rangeSelectKey: "lastTime",
    page: 1,
    filters: undefined,
  };

  const { paramsState, setParams } = useURLParams(defaultSearchParams, [
    "accountName",
  ]);

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
    paramsState.fromBlock || fromDateParam || defaultFromDate;
  let effectiveToBlock = paramsState.toBlock || toDateParam;

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

  // Update chartData to return loading, error, and data
  const {
    accountBalanceHistory: chartData,
    isAccountBalanceHistoryLoading: isChartDataLoading,
    isAccountBalanceHistoryError: isChartDataError,
  } = useBalanceHistory(
    accountNameFromRoute,
    paramsState.coinType,
    undefined,
    5000, // Default size for chart data
    "desc",
    effectiveFromBlock,
    effectiveToBlock
  );

  // Use useMemo to memoize the prepared data so it only recalculates when chartData changes
  const preparedData = useMemo(() => {
    return chartData
      ? prepareData(chartData.operations_result?.slice().reverse())
      : [];
  }, [chartData]); // This will only recompute when chartData changes

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

  // get the accountName
  const routeAccountName = Array.isArray(router.query.accountName)
    ? router.query.accountName[0] // If it's an array, get the first element
    : router.query.accountName; // Otherwise, treat it as a string directly

  if (routeAccountName && !routeAccountName.startsWith("@")) {
    return <ErrorPage />;
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
        accountNameFromRoute && (
          <div className="page-container">
            <Card data-testid="account-details">
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-4 bg-theme dark:bg-theme">
                  <div className="flex items-center gap-4">
                    <Image
                      className="rounded-full border-2 border-explorer-orange"
                      src={getHiveAvatarUrl(accountNameFromRoute)}
                      alt="avatar"
                      width={60}
                      height={60}
                      data-testid="user-avatar"
                    />
                    <div>
                      <h2
                        className="text-lg font-semibold text-gray-800 dark:text-white"
                        data-testid="account-name"
                      >
                        <Link
                          className="text-link"
                          href={`/@${accountNameFromRoute}`}
                        >
                          {accountNameFromRoute}
                        </Link>
                        / <span className="text-text">Balance History</span>
                      </h2>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <BalanceHistorySearch
              paramsState={paramsState}
              setParams={setParams}
            />

            {!isAccountBalanceHistoryLoading &&
            !accountBalanceHistory?.total_operations ? (
              <div>
                <NoResult />
              </div>
            ) : isAccountBalanceHistoryLoading ? (
              <div className="flex justify-center text-center items-center">
                <Loader2 className="animate-spin mt-1 h-12 w-12 ml-3" />
              </div>
            ) : (
              <>
                <Card data-testid="account-details">
                  {message && (
                    <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg mb-4 text-center text-sm text-gray-500">
                      {message}
                      <br />
                      Results are limited to 5000 records and grouped by day.
                      <br />
                    </div>
                  )}

                  {isChartDataLoading ? (
                    <div className="flex justify-center text-center items-center">
                      <Loader2 className="animate-spin mt-1 h-16 w-10 ml-10 dark:text-white" />
                    </div>
                  ) : !isChartDataError ? (
                    <MemoizedBalanceHistoryChart
                      hiveBalanceHistoryData={
                        !paramsState.coinType || paramsState.coinType === "HIVE"
                          ? preparedData
                          : undefined
                      }
                      vestsBalanceHistoryData={
                        paramsState.coinType === "VESTS"
                          ? preparedData
                          : undefined
                      }
                      hbdBalanceHistoryData={
                        paramsState.coinType === "HBD"
                          ? preparedData
                          : undefined
                      }
                      quickView={false}
                      className="h-[450px] mb-10 mr-0 pr-1 pb-6"
                    />
                  ) : (
                    <div>Error loading chart data</div>
                  )}
                </Card>

                <BalanceHistoryTable
                  operations={convertBalanceHistoryResultsToTableOperations(
                    accountBalanceHistory
                  )}
                  total_operations={accountBalanceHistory.total_operations}
                  total_pages={accountBalanceHistory.total_pages}
                  current_page={paramsState.page}
                  account_name={accountNameFromRoute}
                />
              </>
            )}
            <div className="fixed bottom-[10px] right-0 flex flex-col items-end justify-end px-3 md:px-12">
              <ScrollTopButton />
            </div>
          </div>
        )
      )}
    </>
  );
}
