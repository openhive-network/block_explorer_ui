import { sumAccountValue } from "@/utils/accountValue";

const hbd = (amount: string) => ({ amount, precision: 3, nai: "@@000000013" });
const toDollars = (satoshis: Record<string, string>) =>
  Object.fromEntries(
    Object.entries(satoshis).map(([key, amount]) => [key, hbd(amount)])
  );

// The wallet's per-field dollar values (HBD satoshis) for three real accounts
// at block 110790493, feed 0.053 HBD/HIVE. Zero entries left out.
const ARCANGE_MID_POWER_DOWN = {
  hbd_balance: "496275",
  hbd_saving_balance: "11770790",
  balance: "2588",
  received_vesting_shares: "17781",
  vesting_shares: "6793340",
  vesting_withdraw_rate: "2263703",
};
const MITCH18_FINAL_PAYMENT = {
  hbd_saving_balance: "13",
  balance: "1384",
  vesting_shares: "692",
  vesting_withdraw_rate: "692",
};
const GTG_NO_POWER_DOWN = {
  balance: "201",
  received_vesting_shares: "3579",
  vesting_shares: "118548022",
};

describe("sumAccountValue", () => {
  it("counts the power-down instalment once, inside the staked HP", () => {
    expect(sumAccountValue(toDollars(ARCANGE_MID_POWER_DOWN))).toBe(
      496275 + 11770790 + 2588 + 6793340
    );
  });

  it("does not double the last instalment of a full power down", () => {
    expect(sumAccountValue(toDollars(MITCH18_FINAL_PAYMENT))).toBe(
      13 + 1384 + 692
    );
  });

  it("leaves received delegations out when nothing is powering down", () => {
    expect(sumAccountValue(toDollars(GTG_NO_POWER_DOWN))).toBe(201 + 118548022);
  });

  it("ignores entries that are not assets, such as the previous total", () => {
    expect(
      sumAccountValue({ ...toDollars(GTG_NO_POWER_DOWN), account_value: null })
    ).toBe(201 + 118548022);
  });
});
