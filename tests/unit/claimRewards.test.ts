import {
  buildClaimRewardOperation,
  hasRewardsToClaim,
  isKeychainCancel,
  naiToDecimal,
} from "@/utils/claimRewards";

const hive = (amount: string) => ({ amount, precision: 3, nai: "@@000000021" });
const hbd = (amount: string) => ({ amount, precision: 3, nai: "@@000000013" });
const vests = (amount: string) => ({
  amount,
  precision: 6,
  nai: "@@000000037",
});

describe("naiToDecimal", () => {
  it("places the decimal point by precision", () => {
    expect(naiToDecimal(hive("1234"))).toBe("1.234");
    expect(naiToDecimal(vests("12345678901"))).toBe("12345.678901");
  });

  it("pads small and zero amounts", () => {
    expect(naiToDecimal(hive("5"))).toBe("0.005");
    expect(naiToDecimal(hive("0"))).toBe("0.000");
    expect(naiToDecimal(vests("1"))).toBe("0.000001");
  });

  it("keeps amounts beyond float precision exact", () => {
    expect(naiToDecimal(vests("123456789012345678"))).toBe(
      "123456789012.345678"
    );
  });
});

describe("hasRewardsToClaim", () => {
  const zero = {
    reward_hive_balance: hive("0"),
    reward_hbd_balance: hbd("0"),
    reward_vesting_balance: vests("0"),
  };

  it("is false when every balance is zero", () => {
    expect(hasRewardsToClaim(zero)).toBe(false);
  });

  it("is true when any one balance is non-zero", () => {
    expect(
      hasRewardsToClaim({ ...zero, reward_vesting_balance: vests("1") })
    ).toBe(true);
    expect(hasRewardsToClaim({ ...zero, reward_hbd_balance: hbd("10") })).toBe(
      true
    );
  });
});

describe("buildClaimRewardOperation", () => {
  it("claims every balance in legacy asset format", () => {
    expect(
      buildClaimRewardOperation("alice", {
        reward_hive_balance: hive("1234"),
        reward_hbd_balance: hbd("0"),
        reward_vesting_balance: vests("2500000"),
      })
    ).toEqual([
      "claim_reward_balance",
      {
        account: "alice",
        reward_hive: "1.234 HIVE",
        reward_hbd: "0.000 HBD",
        reward_vests: "2.500000 VESTS",
      },
    ]);
  });
});

describe("isKeychainCancel", () => {
  it("recognises Keychain's cancel message", () => {
    expect(isKeychainCancel("Request was canceled by the user.")).toBe(true);
  });

  it("treats other failures as errors", () => {
    expect(isKeychainCancel("KEYCHAIN_TIMEOUT")).toBe(false);
    expect(isKeychainCancel(new Error("missing posting authority"))).toBe(
      false
    );
  });
});
