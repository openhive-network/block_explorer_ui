import { useQuery, UseQueryResult } from "@tanstack/react-query";

import fetchingService from "@/services/FetchingService";
import { config } from "@/Config";
import Hive from "@/types/Hive";

const useAccountContentStats = (
  accountName: string,
  granularity: "day" | "week" | "month" = "month",
  fromDate?: Date | number | undefined,
  toDate?: Date | number | undefined,
  liveDataEnabled?: boolean,
  enabled: boolean = true
) => {
  const {
    data: accountContentStats,
    isLoading: isAccountContentStatsLoading,
    isError: isAccountContentStatsError,
  }: UseQueryResult<Hive.AccountContentStatsResponse[] | undefined> = useQuery({
    queryKey: [
      "account_content_stats",
      accountName,
      granularity,
      fromDate,
      toDate,
    ],
    queryFn: () =>
      fetchingService.getAccountContentStats(
        accountName,
        fromDate,
        toDate,
        granularity
      ),
    enabled: !!accountName && enabled,
    refetchInterval: liveDataEnabled ? config.mainRefreshInterval : false,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    staleTime: 30 * 60 * 1000,
  });

  return {
    accountContentStats,
    isAccountContentStatsLoading,
    isAccountContentStatsError,
  };
};

export default useAccountContentStats;
