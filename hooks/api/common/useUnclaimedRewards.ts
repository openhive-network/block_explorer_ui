import { useQuery } from "@tanstack/react-query";

import fetchingService from "@/services/FetchingService";

const REFRESH_MS = 5 * 60 * 1000;

// True when the account has any author/curation reward waiting to be claimed.
const useUnclaimedRewards = (accountName: string | null) => {
  const { data: hasUnclaimedRewards = false } = useQuery({
    queryKey: ["unclaimedRewards", accountName],
    queryFn: () => fetchingService.findAccounts([accountName as string]),
    select: ({ accounts }) => {
      const account = accounts[0];
      if (!account) return false;
      return [
        account.reward_hive_balance,
        account.reward_hbd_balance,
        account.reward_vesting_balance,
      ].some((balance) => balance.amount !== "0");
    },
    enabled: !!accountName,
    refetchInterval: REFRESH_MS,
    refetchOnWindowFocus: false,
  });

  return { hasUnclaimedRewards };
};

export default useUnclaimedRewards;
