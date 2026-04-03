import { useQuery, UseQueryResult } from "@tanstack/react-query";

import fetchingService from "@/services/FetchingService";
import { config } from "@/Config";
import Hive from "@/types/Hive";

const useTotalValueLocked = (liveDataEnabled?: boolean) => {
  const {
    data: totalValueLocked,
    isLoading: isTotalValueLockedLoading,
    isError: isTotalValueLockedError,
  }: UseQueryResult<Hive.TotalValueLocked | undefined> = useQuery({
    queryKey: ["get_total_value_locked"],
    queryFn: () => fetchingService.getTotalValueLocked(),
    refetchInterval: liveDataEnabled ? config.mainRefreshInterval : false,
    refetchOnWindowFocus: false,
  });

  return {
    totalValueLocked,
    isTotalValueLockedLoading,
    isTotalValueLockedError,
  };
};

export default useTotalValueLocked;
