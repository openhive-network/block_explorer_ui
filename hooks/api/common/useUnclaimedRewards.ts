import { useQuery } from "@tanstack/react-query";

import fetchingService from "@/services/FetchingService";
import { RewardBalances, hasRewardsToClaim } from "@/utils/claimRewards";

const REFRESH_MS = 5 * 60 * 1000;
// Covers the gap after a claim, when the cache is zeroed before the node has
// the block: a newly opened menu must not re-read the old balances.
const STALE_MS = 10 * 1000;

// The account's author/curation rewards waiting to be claimed.
const useUnclaimedRewards = (accountName: string | null) => {
  const { data: rewards } = useQuery({
    queryKey: ["unclaimedRewards", accountName],
    queryFn: () => fetchingService.findAccounts([accountName as string]),
    select: ({ accounts }): RewardBalances | undefined => accounts[0],
    enabled: !!accountName,
    refetchInterval: REFRESH_MS,
    staleTime: STALE_MS,
    refetchOnWindowFocus: false,
  });

  return {
    rewards,
    hasUnclaimedRewards: !!rewards && hasRewardsToClaim(rewards),
  };
};

export default useUnclaimedRewards;
