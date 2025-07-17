import { UseQueryResult, useQuery } from "@tanstack/react-query";
import moment from "moment";

import fetchingService from "@/services/FetchingService";
import useMarketHistory from "@/hooks/common/useMarketHistory";
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
    if (!marketHistory || !accountBalanceHistory) return [];

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
    isAccountBalanceHistoryError,
  };
};

export default useBalanceHistory;
