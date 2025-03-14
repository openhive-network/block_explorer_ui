import { useQuery } from "@tanstack/react-query";
import moment from "moment";

import fetchingService from "@/services/FetchingService";

const useAggregatedBalanceHistory = (
  accountName: string,
  coinType: string,
  granularity: "daily"|"monthly"|"yearly",
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

  return {
    aggregatedAccountBalanceHistory,
    isAggregatedAccountBalanceHistoryLoading,
    isAggregatedAccountBalanceHistoryError,
  };
};

export default useAggregatedBalanceHistory;
