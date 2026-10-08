import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import fetchingService from "@/services/FetchingService";
import useMarketHistory from "@/hooks/common/useMarketHistory";
import { getDayRangeOfRows } from "@/utils/BalanceHistoryUtils";
import { calculateCloseHivePrice } from "@/components/home/MarketHistoryChart";

const useAggregatedBalanceHistory = (
  accountName: string,
  coinType: string,
  granularity: "daily" | "monthly" | "yearly",
  direction: "asc" | "desc",
  fromDate?: Date | number | undefined,
  toDate?: Date | number | undefined
) => {
  const fetchBalanceHist = async () => {
    if (fromDate && toDate && moment(fromDate).isAfter(moment(toDate))) {
      return null;
    }

    return await fetchingService.geAccountAggregatedtBalanceHistory(
      accountName,
      coinType,
      granularity,
      direction,
      fromDate ? fromDate : undefined,
      toDate ? toDate : undefined
    );
  };

  const {
    data: aggregatedAccountBalanceHistory,
    isLoading: isAggregatedAccountBalanceHistoryLoading,
    isFetching: isAggregatedAccountBalanceHistoryFetching,
    isError: isAggregatedAccountBalanceHistoryError,
  }: any = useQuery({
    queryKey: [
      "get_balance_aggregation",
      accountName,
      coinType,
      direction,
      fromDate,
      toDate,
    ],
    queryFn: fetchBalanceHist,
    enabled: !!accountName,
    refetchOnWindowFocus: false,
  });

  // A block range has no dates of its own: price the days its rows fall on.
  const isBlockRange =
    typeof fromDate === "number" || typeof toDate === "number";
  const rowsDayRange = isBlockRange
    ? getDayRangeOfRows(
        aggregatedAccountBalanceHistory?.map(
          (row: { date: string }) => row.date
        )
      )
    : undefined;

  const start = isBlockRange
    ? (rowsDayRange?.start ??
      moment().startOf("day").format("YYYY-MM-DDTHH:mm:ss"))
    : fromDate
      ? moment(fromDate).startOf("day").format("YYYY-MM-DDTHH:mm:ss")
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
    if (!aggregatedAccountBalanceHistory) return null;
    // No prices yet, or the price request failed: show the balances without them.
    if (!marketHistory) return aggregatedAccountBalanceHistory;

    return aggregatedAccountBalanceHistory.map((balance: any) => {
      const { buckets } = marketHistory;

      const { date: balanceDate } = balance;
      const balanceKey = balanceDate.slice(0, 10);
      const bucket = buckets.find(
        ({ open }) => open.slice(0, 10) === balanceKey
      );

      const hive = bucket?.hive;
      const non_hive = bucket?.non_hive;
      const hiveClosePrice = calculateCloseHivePrice(hive, non_hive);

      const result = !bucket
        ? balance
        : { ...balance, hivePrice: hiveClosePrice };

      return result;
    });
  };

  const newdata = getHistoryWithHivePrice();

  return {
    aggregatedAccountBalanceHistory: newdata,
    isAggregatedAccountBalanceHistoryLoading,
    isAggregatedAccountBalanceHistoryFetching,
    isAggregatedAccountBalanceHistoryError,
  };
};

export default useAggregatedBalanceHistory;
