import { useQuery, UseQueryResult } from "@tanstack/react-query";

import fetchingService from "@/services/FetchingService";
import { config } from "@/Config";
import Hive from "@/types/Hive";

const useAccountVestingStats = (
  accountName: string,
  granularity: "daily" | "monthly" | "yearly" = "daily",
  fromDate?: Date | number | undefined,
  toDate?: Date | number | undefined,
  direction: "asc" | "desc" = "asc",
  liveDataEnabled?: boolean
) => {
  const {
    data: accountVestingStats,
    isLoading: isAccountVestingStatsLoading,
    isError: isAccountVestingStatsError,
  }: UseQueryResult<Hive.AccountVestingStatsResponse[] | undefined> = useQuery({
    queryKey: [
      "accountVestingStats",
      accountName,
      granularity,
      fromDate,
      toDate,
      direction,
    ],
    queryFn: () =>
      fetchingService.getAccountVestingStats(
        accountName,
        granularity,
        fromDate,
        toDate,
        direction
      ),
    enabled: !!accountName,
    refetchInterval: liveDataEnabled ? config.mainRefreshInterval : false,
    refetchOnWindowFocus: false,
  });

  return {
    accountVestingStats,
    isAccountVestingStatsLoading,
    isAccountVestingStatsError,
  };
};

export default useAccountVestingStats;
