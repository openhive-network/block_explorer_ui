import { useQuery } from "@tanstack/react-query";

import fetchingService from "@/services/FetchingService";
import { naiAssetToFloat } from "@/utils/Calculations";
import { governanceWeight } from "@/utils/governanceVests";
import { isHiveAccountName } from "@/utils/StringUtils";
import { parseChainDate } from "@/utils/TimeUtils";
import { RewardFundFigures } from "@/utils/voteValue";

// The pool and the feed move every block and every hour; a minute keeps the
// "as of" line honest without hammering the node.
const REFRESH_MS = 60 * 1000;

export interface VoteValueRates extends RewardFundFigures {
  hivePerVests: number;
  votePowerReserveRate: number;
  headBlock: number;
  asOf: Date | null;
}

// The figures a vote's value is worked out from, shared by every lookup.
export const useVoteValueRates = () =>
  useQuery({
    queryKey: ["voteValueRates"],
    queryFn: async (): Promise<VoteValueRates> => {
      const [globals, feed, { funds }] = await Promise.all([
        fetchingService.getDynamicGlobalProperties(),
        fetchingService.getCurrentPriceFeed(),
        fetchingService.getRewardFunds(),
      ]);
      const post = funds.find((fund) => fund.name === "post") ?? funds[0];
      const shares = naiAssetToFloat(globals.total_vesting_shares);
      const hive = naiAssetToFloat(feed.quote);
      return {
        hivePerVests:
          shares > 0
            ? naiAssetToFloat(globals.total_vesting_fund_hive) / shares
            : 0,
        hbdPerHive: hive > 0 ? naiAssetToFloat(feed.base) / hive : 0,
        rewardBalanceHive: naiAssetToFloat(post?.reward_balance),
        recentClaims: String(post?.recent_claims ?? "0"),
        // In the node's reply, though not in wax's type; 10 since HF2.
        votePowerReserveRate:
          (globals as { vote_power_reserve_rate?: number })
            .vote_power_reserve_rate ?? 10,
        headBlock: globals.head_block_number,
        asOf: parseChainDate(globals.time),
      };
    },
    refetchInterval: REFRESH_MS,
    staleTime: REFRESH_MS / 2,
    refetchOnWindowFocus: false,
    meta: { suppressErrorToast: true },
  });

// One account's governance weight and voting mana. `account` is null when
// the node has no such account.
const useVotingPower = (accountName: string) => {
  // An impossible name (too short, upper case…) isn't sent to the node.
  const valid = isHiveAccountName(accountName);
  const accountQuery = useQuery({
    queryKey: ["votingPowerAccount", accountName],
    queryFn: async () =>
      (await fetchingService.findAccounts([accountName])).accounts[0] ?? null,
    enabled: valid,
    // Delayed votes, the proxy and the expiry change too, if rarely.
    refetchInterval: REFRESH_MS,
    refetchOnWindowFocus: false,
    meta: { suppressErrorToast: true },
  });
  const account = accountQuery.data;
  const manaQuery = useQuery({
    queryKey: ["votingPowerMana", accountName],
    queryFn: () => fetchingService.getUpvoteManabar(accountName),
    enabled: !!account,
    refetchInterval: REFRESH_MS,
    refetchOnWindowFocus: false,
    meta: { suppressErrorToast: true },
  });
  const ratesQuery = useVoteValueRates();
  const rates = ratesQuery.data ?? null;

  return {
    account,
    governance:
      account && rates && rates.hivePerVests > 0
        ? governanceWeight(account, rates.hivePerVests)
        : null,
    mana: manaQuery.data ?? null,
    rates,
    isLoading:
      valid &&
      (accountQuery.isPending ||
        (!!account && (manaQuery.isPending || ratesQuery.isPending))),
    isError:
      (accountQuery.isError && account === undefined) ||
      (manaQuery.isError && !manaQuery.data) ||
      (ratesQuery.isError && !rates) ||
      // A node reply without vesting totals can't be turned into HP.
      (!!rates && !(rates.hivePerVests > 0)),
  };
};

export default useVotingPower;
