import { useQuery, UseQueryResult } from "@tanstack/react-query";

import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";

const usePendingAuthorRewards = (accountName: string) => {
  const {
    data: pendingAuthorRewards,
    isLoading: isPendingAuthorRewardsLoading,
    isError: isPendingAuthorRewardsError,
  }: UseQueryResult<Hive.PendingAuthorRewardsResponse> = useQuery({
    queryKey: ["pending_author_rewards", accountName],
    queryFn: () => fetchingService.getPendingAuthorRewards(accountName),
    refetchOnWindowFocus: false,
    enabled: !!accountName,
  });

  return {
    pendingAuthorRewards,
    isPendingAuthorRewardsLoading,
    isPendingAuthorRewardsError,
  };
};

export default usePendingAuthorRewards;
