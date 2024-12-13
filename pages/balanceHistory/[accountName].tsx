import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

import { config } from "@/Config";

import { Loader2 } from "lucide-react";

import useBalanceHistory from "@/hooks/api/balanceHistory/useBalanceHistory";
import useURLParams from "@/hooks/common/useURLParams";

import { convertBalanceHistoryResultsToTableOperations } from "@/lib/utils";
import { getHiveAvatarUrl } from "@/utils/HiveBlogUtils";

import BalanceHistoryTable from "@/components/balanceHistory/BalanceHistoryTable";
import BalanceHistorySearch from "@/components/home/searches/BalanceHistorySearch";
import { Card, CardHeader } from "@/components/ui/card";

export default function BalanceHistory() {
  const router = useRouter();
  const accountNameFromRoute = (router.query.accountName as string)?.slice(1);

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
    filters: boolean[];
  }

  const defaultSearchParams: BalanceHistorySearchParams = {
    accountName: accountNameFromRoute,
    coinType: "HIVE",
    fromBlock: undefined,
    toBlock: undefined,
    fromDate: undefined,
    toDate: undefined,
    lastBlocks: undefined,
    lastTime: undefined,
    timeUnit: "days",
    rangeSelectKey: "none",
    page: 1,
    filters: [],
  };

  const { paramsState } = useURLParams(defaultSearchParams, ["accountName"]);

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

  let effectiveFromBlock = paramsState.fromBlock || fromDateParam;
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

  return (
    <>
      <Head>
        <title>@{accountNameFromRoute} - Hive Explorer</title>
      </Head>

      <div className="w-[95%] overflow-auto">
        <Card data-testid="account-details">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-4 bg-theme dark:bg-theme">
              {/* Avatar and Name */}
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
                      {" "}
                      {accountNameFromRoute}
                    </Link>
                    / <span className="text-text">Balance History</span>
                  </h2>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Filter Options (Always visible) */}
        <BalanceHistorySearch />

        {/* Show Error Message if No Balance History and No Loading State */}
        {!isAccountBalanceHistoryLoading && !accountBalanceHistory?.total_operations ? (
          <div className="w-full my-4 text-black text-center">
            No operations were found.
          </div>
        ) : isAccountBalanceHistoryLoading ? (
          <div className="flex justify-center text-center items-center">
            <Loader2 className="animate-spin mt-1 text-black h-12 w-12 ml-3" />
          </div>
        ) : (
          // Show the table when balance history exists
          <BalanceHistoryTable
            operations={convertBalanceHistoryResultsToTableOperations(
              accountBalanceHistory
            )}
            total_operations={accountBalanceHistory.total_operations}
            total_pages={accountBalanceHistory.total_pages}
            current_page={paramsState.page}
          />
        )}
      </div>
    </>
  );
}
