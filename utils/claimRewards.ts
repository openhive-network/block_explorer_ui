import Hive from "@/types/Hive";

// The reward balances find_accounts reports, as NAI assets.
export interface RewardBalances {
  reward_hive_balance: Hive.Supply;
  reward_hbd_balance: Hive.Supply;
  reward_vesting_balance: Hive.Supply;
}

export const hasRewardsToClaim = (rewards: RewardBalances): boolean =>
  [
    rewards.reward_hive_balance,
    rewards.reward_hbd_balance,
    rewards.reward_vesting_balance,
  ].some((balance) => balance.amount !== "0");

// "1234", precision 3 -> "1.234". String arithmetic keeps every satoshi exact,
// which matters because the chain rejects a claim larger than the balance.
export const naiToDecimal = ({ amount, precision }: Hive.Supply): string => {
  if (precision === 0) return amount;
  const digits = amount.padStart(precision + 1, "0");
  return `${digits.slice(0, -precision)}.${digits.slice(-precision)}`;
};

// Keychain and Hivesigner take operations with legacy "1.234 HIVE" amounts.
export const buildClaimRewardOperation = (
  account: string,
  rewards: RewardBalances
) =>
  [
    "claim_reward_balance",
    {
      account,
      reward_hive: `${naiToDecimal(rewards.reward_hive_balance)} HIVE`,
      reward_hbd: `${naiToDecimal(rewards.reward_hbd_balance)} HBD`,
      reward_vests: `${naiToDecimal(rewards.reward_vesting_balance)} VESTS`,
    },
  ] as const;

// Keychain rejects with its message when the user dismisses the popup.
export const isKeychainCancel = (error: unknown): boolean =>
  typeof error === "string" && /cancel/i.test(error);
