import { useQuery, UseQueryResult } from "@tanstack/react-query";

import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";

const useAccountVestingHistory = (
  accountName: string,
  filter: Hive.VestingHistoryFilter,
  page: number | undefined,
  pageSize: number | undefined,
  direction: "asc" | "desc" = "desc",
  fromDate?: Date | number | undefined,
  toDate?: Date | number | undefined
) => {
  const {
    data: accountVestingHistory,
    isLoading: isAccountVestingHistoryLoading,
    isFetching: isAccountVestingHistoryFetching,
    isError: isAccountVestingHistoryError,
  }: UseQueryResult<Hive.AccountVestingHistoryResponse | undefined> = useQuery({
    queryKey: [
      "accountVestingHistory",
      accountName,
      filter,
      page,
      pageSize,
      direction,
      fromDate,
      toDate,
    ],
    queryFn: () =>
      fetchingService.getAccountVestingHistory(
        accountName,
        filter,
        page,
        pageSize,
        direction,
        fromDate,
        toDate
      ),
    enabled: !!accountName,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });

  return {
    accountVestingHistory,
    isAccountVestingHistoryLoading,
    isAccountVestingHistoryFetching,
    isAccountVestingHistoryError,
  };
};

export default useAccountVestingHistory;
