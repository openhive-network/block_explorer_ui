import { useQuery, UseQueryResult } from "@tanstack/react-query";

import fetchingService from "@/services/FetchingService";
import { config } from "@/Config";
import Hive from "@/types/Hive";

const useVestingStats = (
  granularity: "daily" | "monthly" | "yearly",
  direction: "asc" | "desc" = "asc",
  fromDate?: Date | number | undefined,
  toDate?: Date | number | undefined,
  liveDataEnabled?: boolean
) => {
  const {
    data: vestingStats,
    isLoading: isVestingStatsLoading,
    isError: isVestingStatsError,
  }: UseQueryResult<Hive.VestingStatsResponse[] | undefined> = useQuery({
    queryKey: ["vestingStats", granularity, direction, fromDate, toDate],
    queryFn: () =>
      fetchingService.getVestingStats(granularity, direction, fromDate, toDate),
    refetchInterval: liveDataEnabled ? config.mainRefreshInterval : false,
    refetchOnWindowFocus: false,
  });

  return {
    vestingStats,
    isVestingStatsLoading,
    isVestingStatsError,
  };
};

export default useVestingStats;
