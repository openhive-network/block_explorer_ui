import { useQuery, UseQueryResult } from "@tanstack/react-query";

import fetchingService from "@/services/FetchingService";
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
    queryKey: ["vestingStats", granularity, direction, fromDate, toDate, liveDataEnabled],
    queryFn: async () => {
      if (liveDataEnabled) {
        return await fetchingService.getVestingStats(
          granularity,
          direction,
          fromDate,
          toDate
        );
      }
      return [];
    },
  });

  return {
    vestingStats,
    isVestingStatsLoading,
    isVestingStatsError,
  };
};

export default useVestingStats;
