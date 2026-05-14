import { useQuery, UseQueryResult } from "@tanstack/react-query";

import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";

const useAccountVestingStats = (
  accountName: string,
  fromDate?: Date | number | undefined,
  toDate?: Date | number | undefined
) => {
  const {
    data: accountVestingStats,
    isLoading: isAccountVestingStatsLoading,
    isError: isAccountVestingStatsError,
  }: UseQueryResult<Hive.AccountVestingStatsResponse | undefined> = useQuery({
    queryKey: ["accountVestingStats", accountName, fromDate, toDate],
    queryFn: () =>
      fetchingService.getAccountVestingStats(accountName, fromDate, toDate),
    enabled: !!accountName,
    refetchOnWindowFocus: false,
  });

  return {
    accountVestingStats,
    isAccountVestingStatsLoading,
    isAccountVestingStatsError,
  };
};

export default useAccountVestingStats;
