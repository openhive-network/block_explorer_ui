import Hive from "@/types/Hive";
import { CoinType, BalanceType } from "@/hooks/api/common/useTopHolders";

// Account's raw balance for a coin/balance-type, in top-holders `value` scale.
export const getAccountBalanceRaw = (
  b: Hive.AccountBalancesResponse | undefined,
  coinType: CoinType,
  balanceType: BalanceType
): number | null => {
  if (!b) return null;
  let v: number;
  if (coinType === "VESTS") v = Number(b.vesting_shares);
  else {
    const liquid = coinType === "HIVE" ? b.hive_balance : b.hbd_balance;
    const savings = coinType === "HIVE" ? b.hive_savings : b.hbd_savings;
    if (balanceType === "savings_balance") v = savings;
    else if (balanceType === "total") v = Number(liquid) + Number(savings);
    else v = liquid;
  }
  return Number.isFinite(v) && v > 0 ? v : null;
};
