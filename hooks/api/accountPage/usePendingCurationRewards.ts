import { useQuery, UseQueryResult } from "@tanstack/react-query";

import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";

const usePendingCurationRewards = (accountName: string) => {
  const {
    data: pendingCurationRewards,
    isLoading: isPendingCurationRewardsLoading,
    isError: isPendingCurationRewardsError,
  }: UseQueryResult<Hive.PendingCurationRewardsResponse> = useQuery({
    queryKey: ["pending_curation_rewards", accountName],
    queryFn: () => fetchingService.getPendingCurationRewards(accountName),
    refetchOnWindowFocus: false,
    enabled: !!accountName,
  });

  return {
    pendingCurationRewards,
    isPendingCurationRewardsLoading,
    isPendingCurationRewardsError,
  };
};

export default usePendingCurationRewards;
