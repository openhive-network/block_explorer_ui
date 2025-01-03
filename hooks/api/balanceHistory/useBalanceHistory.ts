import { UseQueryResult, useQuery } from "@tanstack/react-query";
import moment from "moment";

import fetchingService from "@/services/FetchingService";

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

  return {
    accountBalanceHistory,
    isAccountBalanceHistoryLoading,
    isAccountBalanceHistoryError,
  };
};

export default useBalanceHistory;
