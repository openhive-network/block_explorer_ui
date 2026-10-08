import { useQuery } from "@tanstack/react-query";
import moment from "moment";

import fetchingService from "@/services/FetchingService";
import useMarketHistory from "@/hooks/common/useMarketHistory";
import { getDayRangeOfRows } from "@/utils/BalanceHistoryUtils";
import { calculateCloseHivePrice } from "@/components/home/MarketHistoryChart";

const useBalanceHistory = (
  accountName: string,
  coinType: string,
  page: number | undefined,
  pageSize: number | undefined,
  direction: "asc" | "desc",
  fromDate?: Date | number | undefined,
  toDate?: Date | number | undefined
) => {
  const fetchBalanceHist = async () => {
    if (fromDate && toDate && moment(fromDate).isAfter(moment(toDate))) {
      return [];
    }

    return await fetchingService.geAccounttBalanceHistory(
      accountName,
      coinType,
      page,
      pageSize,
      direction,
      fromDate ? fromDate : undefined,
      toDate ? toDate : undefined
    );
  };

  const {
    data: accountBalanceHistory,
    isLoading: isAccountBalanceHistoryLoading,
    isFetching: isAccountBalanceHistoryFetching,
    isError: isAccountBalanceHistoryError,
  }: any = useQuery({
    queryKey: [
      "get_balance_history",
      accountName,
      coinType,
      page,
      pageSize,
      direction,
      fromDate,
      toDate,
    ],
    queryFn: fetchBalanceHist,
    keepPreviousData: true,
    enabled: !!accountName,
    refetchOnWindowFocus: false,
  });

  // A block range has no dates of its own: price the days its rows fall on.
  const isBlockRange =
    typeof fromDate === "number" || typeof toDate === "number";
  const rowsDayRange = isBlockRange
    ? getDayRangeOfRows(
        accountBalanceHistory?.operations_result?.map(
          (row: { timestamp: string }) => row.timestamp
        )
      )
    : undefined;

  const start = isBlockRange
    ? (rowsDayRange?.start ??
      moment().startOf("day").format("YYYY-MM-DDTHH:mm:ss"))
    : fromDate
      ? moment(fromDate).format("YYYY-MM-DDTHH:mm:ss")
      : undefined;

  // Prices come in daily buckets, so an open range ends at the end of today:
  // the current second would make a new query on every render.
  const end = isBlockRange
    ? (rowsDayRange?.end ?? moment().endOf("day").format("YYYY-MM-DDTHH:mm:ss"))
    : toDate
      ? moment(toDate).format("YYYY-MM-DDTHH:mm:ss")
      : moment().endOf("day").format("YYYY-MM-DDTHH:mm:ss");

  const { marketHistory } = useMarketHistory(86400, start, end);

  const getHistoryWithHivePrice = () => {
    if (!accountBalanceHistory) return [];
    // No prices yet, or the price request failed: show the balances without them.
    if (!marketHistory) return accountBalanceHistory;

    const udatedOperationResult = accountBalanceHistory?.operations_result?.map(
      (balance: any) => {
        const { buckets } = marketHistory;

        const { timestamp: balanceDate } = balance;
        const balanceKey = balanceDate.slice(0, 10);
        const bucket = buckets.find(
          ({ open }) => open.slice(0, 10) === balanceKey
        );

        if (!bucket) return balance;

        const { hive, non_hive } = bucket;
        const hiveClosePrice = calculateCloseHivePrice(hive, non_hive);

        return {
          ...balance,
          hivePrice: hiveClosePrice,
        };
      }
    );
    return {
      ...accountBalanceHistory,
      operations_result: udatedOperationResult,
    };
  };

  return {
    accountBalanceHistory: getHistoryWithHivePrice(),
    isAccountBalanceHistoryLoading,
    isAccountBalanceHistoryFetching,
    isAccountBalanceHistoryError,
  };
};

export default useBalanceHistory;
