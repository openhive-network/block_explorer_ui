import Hive from "@/types/Hive";
import { CoinType, BalanceType } from "@/hooks/api/common/useTopHolders";

// Account's raw balance for a coin/balance-type, in top-holders `value` scale.
export const getAccountBalanceRaw = (
  b: Hive.AccountBalancesResponse | undefined,
  coinType: CoinType,
  balanceType: BalanceType
): number | null => {
  if (!b) return null;
  const savings = balanceType === "savings_balance";
  let v: number;
  if (coinType === "VESTS") v = Number(b.vesting_shares);
  else if (coinType === "HIVE") v = savings ? b.hive_savings : b.hive_balance;
  else v = savings ? b.hbd_savings : b.hbd_balance;
  return Number.isFinite(v) && v > 0 ? v : null;
};
