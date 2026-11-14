import { useQuery } from "@tanstack/react-query";

import fetchingService from "@/services/FetchingService";
import { RewardBalances, hasRewardsToClaim } from "@/utils/claimRewards";

// Shared with useGovernanceWeight, which reads the same account. STALE_MS
// covers the gap after a claim, when the cache is zeroed before the node has
// the block: a newly opened menu must not re-read the old balances.
export const ACCOUNT_QUERY_OPTIONS = {
  refetchInterval: 5 * 60 * 1000,
  staleTime: 10 * 1000,
  refetchOnWindowFocus: false,
} as const;

// The account's author/curation rewards waiting to be claimed.
const useUnclaimedRewards = (accountName: string | null) => {
  const { data: rewards } = useQuery({
    queryKey: ["unclaimedRewards", accountName],
    queryFn: () => fetchingService.findAccounts([accountName as string]),
    select: ({ accounts }): RewardBalances | undefined => accounts[0],
    enabled: !!accountName,
    ...ACCOUNT_QUERY_OPTIONS,
  });

  return {
    rewards,
    hasUnclaimedRewards: !!rewards && hasRewardsToClaim(rewards),
  };
};

export default useUnclaimedRewards;
