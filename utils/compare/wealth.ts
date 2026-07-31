import { grabNumericValue } from "@/utils/StringUtils";

// Mirrors AccountBalanceCard's wallet bar — same eight segments, same order,
// same colours and label keys. That card's local useFinancialSummary is the
// source of truth; keep this in step with it.
//
// All eight together account for every entry `dollars.account_value` sums, so
// the bar's breakdown always reconciles with the headline total (see the unit
// test). Dropping one would silently understate the composition.
export type WealthSegmentKey =
  | "staked"
  | "savings"
  | "liquid"
  | "unclaimed"
  | "openOrders"
  | "locked"
  | "escrow"
  | "poweringDown";

export type WealthComposition = Record<WealthSegmentKey, number>;

const n = (v: unknown): number =>
  v === undefined || v === null ? 0 : grabNumericValue(String(v));

export const buildWealthComposition = (
  dollars: Record<string, unknown>
): WealthComposition => ({
  staked: n(dollars.vesting_shares),
  savings:
    n(dollars.savings_balance) +
    n(dollars.hbd_saving_balance) +
    n(dollars.savings_pending_amount_hive) +
    n(dollars.savings_pending_amount_hbd),
  liquid: n(dollars.balance) + n(dollars.hbd_balance),
  unclaimed:
    n(dollars.reward_hive_balance) +
    n(dollars.reward_hbd_balance) +
    n(dollars.reward_vesting_balance),
  openOrders:
    n(dollars.open_orders_hive_amount) + n(dollars.open_orders_hbd_amount),
  locked:
    n(dollars.conversion_pending_amount_hive) +
    n(dollars.conversion_pending_amount_hbd),
  escrow:
    n(dollars.escrow_pending_amount_hive) +
    n(dollars.escrow_pending_amount_hbd),
  poweringDown: n(dollars.vesting_withdraw_rate),
});

export const WEALTH_SEGMENTS: {
  key: WealthSegmentKey;
  labelKey: string;
  color: string;
}[] = [
  { key: "staked", labelKey: "accountBalanceCard.staked", color: "#8b5cf6" },
  { key: "savings", labelKey: "accountBalanceCard.savings", color: "#f59e0b" },
  { key: "liquid", labelKey: "accountBalanceCard.liquid", color: "#0ea5e9" },
  {
    key: "unclaimed",
    labelKey: "accountBalanceCard.unclaimed",
    color: "#14b8a6",
  },
  {
    key: "openOrders",
    labelKey: "accountBalanceCard.openOrders",
    color: "#6366f1",
  },
  { key: "locked", labelKey: "accountBalanceCard.locked", color: "#db2777" },
  { key: "escrow", labelKey: "accountBalanceCard.escrow", color: "#94a3b8" },
  {
    key: "poweringDown",
    labelKey: "accountBalanceCard.powerDown",
    color: "#f43f5e",
  },
];

export const wealthTotal = (c: WealthComposition): number =>
  WEALTH_SEGMENTS.reduce((sum, s) => sum + Math.max(0, c[s.key]), 0);
