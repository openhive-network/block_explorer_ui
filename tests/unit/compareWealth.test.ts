import {
  buildWealthComposition,
  WEALTH_SEGMENTS,
  wealthTotal,
} from "@/utils/compare/wealth";

// Every `dollars.*` entry that useConvertedAccountDetails folds into
// account_value, except the two it deliberately skips (delegated/received
// vesting). Values are the formatted HBD strings the real object carries.
const dollars = {
  account_value: "0 HBD",
  vesting_shares: "1,000.000 HBD",
  savings_balance: "20.000 HBD",
  hbd_saving_balance: "3.000 HBD",
  savings_pending_amount_hive: "4.000 HBD",
  savings_pending_amount_hbd: "5.000 HBD",
  balance: "60.000 HBD",
  hbd_balance: "7.000 HBD",
  reward_hive_balance: "8.000 HBD",
  reward_hbd_balance: "9.000 HBD",
  reward_vesting_balance: "10.000 HBD",
  open_orders_hive_amount: "11.000 HBD",
  open_orders_hbd_amount: "12.000 HBD",
  conversion_pending_amount_hive: "13.000 HBD",
  conversion_pending_amount_hbd: "14.000 HBD",
  escrow_pending_amount_hive: "15.000 HBD",
  escrow_pending_amount_hbd: "16.000 HBD",
  vesting_withdraw_rate: "17.000 HBD",
  // Skipped by account_value, so they must not land in any segment.
  delegated_vesting_shares: "500.000 HBD",
  received_vesting_shares: "600.000 HBD",
};

const SUM_OF_PARTS = 1000 + 32 + 67 + 27 + 23 + 27 + 31 + 17;

describe("compare wealth composition", () => {
  it("covers all eight segments the account card draws", () => {
    expect(WEALTH_SEGMENTS.map((s) => s.key)).toEqual([
      "staked",
      "savings",
      "liquid",
      "unclaimed",
      "openOrders",
      "locked",
      "escrow",
      "poweringDown",
    ]);
  });

  it("splits every dollars entry into exactly one segment", () => {
    const c = buildWealthComposition(dollars);
    expect(c).toEqual({
      staked: 1000,
      savings: 32,
      liquid: 67,
      unclaimed: 27,
      openOrders: 23,
      locked: 27,
      escrow: 31,
      poweringDown: 17,
    });
  });

  // The bar is normalized to this sum while the header prints account_value, so a
  // segment missing here would silently understate the breakdown of the total
  // shown right above it.
  it("reconciles with the account_value the header displays", () => {
    expect(wealthTotal(buildWealthComposition(dollars))).toBe(SUM_OF_PARTS);
  });

  it("leaves delegated and received vesting out of the breakdown", () => {
    const { delegated_vesting_shares, received_vesting_shares, ...without } =
      dollars;
    expect(wealthTotal(buildWealthComposition(without))).toBe(
      wealthTotal(buildWealthComposition(dollars))
    );
  });

  it("treats missing entries as zero rather than NaN", () => {
    const c = buildWealthComposition({});
    expect(wealthTotal(c)).toBe(0);
    expect(Object.values(c).every((v) => v === 0)).toBe(true);
  });
});
