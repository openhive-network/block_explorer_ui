import {
  rsharesToHbd,
  upvoteRshares,
  VOTE_DUST_THRESHOLD,
} from "@/utils/voteValue";

const big = (n: number | string) => BigInt(n);

describe("upvoteRshares (hived's vote_evaluator, HF25+)", () => {
  // 1,000,000,000 VESTS of mana, at the chain's reserve rate of 10.
  const mana = big("1000000000000000");

  it("spends 2% of the current mana on a 100% vote, less the dust threshold", () => {
    // used = mana * 10000 * 86400 / 10000, divided by 10 * 432000 = mana / 50.
    expect(upvoteRshares(mana, 100, 10)).toBe(
      mana / big(50) - VOTE_DUST_THRESHOLD
    );
    expect(upvoteRshares(mana, 100, 10)).toBe(big("19999950000000"));
  });

  it("scales with the vote weight", () => {
    expect(upvoteRshares(mana, 50, 10)).toBe(big("9999950000000"));
    expect(upvoteRshares(mana, 1, 10)).toBe(big("199950000000"));
  });

  it("floors the first step and rounds the second up, as hived does", () => {
    // 12345678901 * 3333 (33.33%) * 86400 / 10000 = 355519996793565.12 ->
    // floored, then / 4,320,000 = 82296295.55... -> 82296296, less the
    // 50,000,000 dust threshold.
    expect(upvoteRshares(big(12345678901), 33.33, 10)).toBe(big(32296296));
    // A different reserve rate changes the divisor.
    expect(upvoteRshares(mana, 100, 20)).toBe(
      mana / big(100) - VOTE_DUST_THRESHOLD
    );
  });

  it("gives nothing for a vote under the dust threshold", () => {
    // 50 * 50,000,000 = 2.5e9 mana: a full vote spends exactly the threshold.
    expect(upvoteRshares(big("2500000000"), 100, 10)).toBe(big(0));
    expect(upvoteRshares(big("2500000050"), 100, 10)).toBe(big(1));
  });

  it("clamps the weight and ignores empty mana", () => {
    expect(upvoteRshares(mana, 250, 10)).toBe(upvoteRshares(mana, 100, 10));
    expect(upvoteRshares(mana, 0, 10)).toBe(big(0));
    expect(upvoteRshares(mana, -20, 10)).toBe(big(0));
    expect(upvoteRshares(big(0), 100, 10)).toBe(big(0));
    expect(upvoteRshares(mana, 100, 0)).toBe(big(0));
  });
});

describe("rsharesToHbd", () => {
  it("matches hived's pending payout for a real post", () => {
    // @bozz/twenty-four-eleven on 2026-11-24: hived reported 7.731 HBD
    // pending for these rshares, with this reward fund and median feed.
    const value = rsharesToHbd(big("157219246679761"), {
      rewardBalanceHive: 1137471.597,
      recentClaims: "786311183678338194",
      hbdPerHive: 0.034,
    });
    expect(Math.abs(value - 7.731) / 7.731).toBeLessThan(0.001);
  });

  it("is 0 without rshares or claims", () => {
    const fund = {
      rewardBalanceHive: 1000,
      recentClaims: "1000000",
      hbdPerHive: 0.25,
    };
    expect(rsharesToHbd(big(0), fund)).toBe(0);
    expect(rsharesToHbd(big(5), { ...fund, recentClaims: "0" })).toBe(0);
    // 500,000 of 1,000,000 claims = half the 1000 HIVE pool, at 0.25 HBD.
    expect(rsharesToHbd(big(500000), fund)).toBe(125);
  });
});
