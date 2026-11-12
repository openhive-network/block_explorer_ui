import {
  useIsMutating,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";
import { useHiveChainContext } from "@/contexts/HiveChainContext";
import useDynamicGlobal, {
  VESTING_RATIO_STALE_MS,
} from "@/hooks/api/homePage/useDynamicGlobal";
import useUnclaimedRewards from "@/hooks/api/common/useUnclaimedRewards";
import { useI18n } from "@/i18n/i18n";
import { deploySettings } from "@/utils/deploySettings";
import { SmartSigner } from "@/lib/smart-signer";
import fetchingService from "@/services/FetchingService";
import { convertVestsToHP } from "@/utils/Calculations";
import { grabNumericValue } from "@/utils/StringUtils";
import {
  RewardBalances,
  buildClaimRewardOperation,
  hasRewardsToClaim,
  isKeychainCancel,
  naiToDecimal,
} from "@/utils/claimRewards";

// The node sees the claim once its block is produced, hafbe once it is
// indexed: re-read after a block or two, and again in case hafbe lagged.
const REFETCH_AFTER_MS = [6000, 15000];

// Claims every pending reward of the signed-in account in one
// claim_reward_balance. Shared by the Wallet card and the user menu: the
// mutation key makes a claim in progress disable both buttons.
const useClaimRewards = () => {
  const { username, method, isLoggedIn } = useAuth();
  const { t, locale } = useI18n();
  const queryClient = useQueryClient();
  const { hiveChain } = useHiveChainContext();
  const { dynamicGlobalData } = useDynamicGlobal(
    undefined,
    VESTING_RATIO_STALE_MS
  );
  const account = isLoggedIn ? username : null;
  const { rewards, hasUnclaimedRewards } = useUnclaimedRewards(account);

  const mutationKey = ["claimRewards", account];
  const isClaiming = useIsMutating({ mutationKey }) > 0;

  const formatClaimed = (claimed: RewardBalances) => {
    const number = (value: number) =>
      value.toLocaleString(locale, {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
      });
    const parts: string[] = [];
    if (claimed.reward_hive_balance.amount !== "0")
      parts.push(
        `${number(Number(naiToDecimal(claimed.reward_hive_balance)))} HIVE`
      );
    if (claimed.reward_hbd_balance.amount !== "0")
      parts.push(
        `${number(Number(naiToDecimal(claimed.reward_hbd_balance)))} HBD`
      );
    if (claimed.reward_vesting_balance.amount !== "0") {
      const g = dynamicGlobalData?.headBlockDetails;
      const hp =
        hiveChain && g
          ? convertVestsToHP(
              hiveChain,
              claimed.reward_vesting_balance,
              g.rawTotalVestingFundHive,
              g.rawTotalVestingShares
            )
          : undefined;
      parts.push(
        hp
          ? `${number(grabNumericValue(hp))} HP`
          : `${naiToDecimal(claimed.reward_vesting_balance)} VESTS`
      );
    }
    return new Intl.ListFormat(locale, { type: "conjunction" }).format(parts);
  };

  const refresh = () => {
    for (const key of [
      "unclaimedRewards",
      "account_details",
      "account_balances",
    ])
      queryClient.invalidateQueries({ queryKey: [key, account] });
  };

  const { mutate } = useMutation({
    mutationKey,
    mutationFn: async () => {
      if (!account || !method) return null;
      // Re-read the balances: the cached ones can be minutes old, and a claim
      // for more than the account holds is rejected.
      const { accounts } = await fetchingService.findAccounts([account]);
      const fresh = accounts[0];
      if (!fresh || !hasRewardsToClaim(fresh)) return null;
      await SmartSigner.broadcast(
        account,
        method,
        [buildClaimRewardOperation(account, fresh)],
        "Posting"
      );
      return fresh as RewardBalances;
    },
    onSuccess: async (claimed) => {
      if (!claimed) {
        toast.info(t("auth.claimRewardsNothing"));
        refresh();
        return;
      }
      toast.success(
        t("auth.claimRewardsSuccess", { amounts: formatClaimed(claimed) }),
        { duration: 8000 }
      );
      // Until the block is produced the node still reports the old balances,
      // so drop any read in flight and clear the dot now; the zeroed data stays
      // fresh (useUnclaimedRewards' staleTime) until the re-reads below.
      await queryClient.cancelQueries({
        queryKey: ["unclaimedRewards", account],
      });
      queryClient.setQueriesData(
        { queryKey: ["unclaimedRewards", account] },
        (old: { accounts: RewardBalances[] } | undefined) =>
          old && {
            ...old,
            accounts: old.accounts.map((a) => ({
              ...a,
              reward_hive_balance: { ...a.reward_hive_balance, amount: "0" },
              reward_hbd_balance: { ...a.reward_hbd_balance, amount: "0" },
              reward_vesting_balance: {
                ...a.reward_vesting_balance,
                amount: "0",
              },
            })),
          }
      );
      REFETCH_AFTER_MS.forEach((ms) => setTimeout(refresh, ms));
    },
    onError: (error) => {
      if (isKeychainCancel(error)) return;
      toast.error(t("auth.claimRewardsError"), { duration: 8000 });
    },
  });

  return {
    rewards,
    // Full explorer only: classic mode can turn login on, but stays read-only.
    canClaim:
      deploySettings.mode === "full" && !!account && hasUnclaimedRewards,
    isClaiming,
    claim: () => {
      if (!isClaiming) mutate();
    },
  };
};

export default useClaimRewards;
