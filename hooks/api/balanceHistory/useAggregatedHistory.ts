import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import fetchingService from "@/services/FetchingService";
import useMarketHistory from "@/hooks/common/useMarketHistory";
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
      return [];
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

  const start = fromDate
    ? moment(fromDate).format("YYYY-MM-DDTHH:mm:ss")
    : undefined;

  const end = toDate
    ? moment(toDate).format("YYYY-MM-DDTHH:mm:ss")
    : moment().format("YYYY-MM-DDTHH:mm:ss");

  const { marketHistory } = useMarketHistory(86400, start, end);

  const getHistoryWithHivePrice = () => {
    if (!marketHistory || !aggregatedAccountBalanceHistory) return [];

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
    isAggregatedAccountBalanceHistoryError,
  };
};

export default useAggregatedBalanceHistory;
