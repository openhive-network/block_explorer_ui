interface NaiAsset {
  amount: string;
  nai: string;
  precision: number;
}

// Delegated and received HP are not the account's own value, and the weekly
// power-down instalment is still part of vesting_shares until it is paid out,
// so adding it again would count it twice.
export const ACCOUNT_VALUE_EXCLUDED = [
  "delegated_vesting_shares",
  "received_vesting_shares",
  "vesting_withdraw_rate",
];

// Total account value in HBD satoshis, summed from the wallet's per-field
// dollar values (each an HBD asset).
export const sumAccountValue = (dollars: Record<string, unknown>): number =>
  Object.entries(dollars).reduce((sum, [key, value]) => {
    if (
      value &&
      Object.prototype.hasOwnProperty.call(value, "amount") &&
      !ACCOUNT_VALUE_EXCLUDED.includes(key)
    ) {
      return sum + Number((value as NaiAsset).amount);
    }
    return sum;
  }, 0);
