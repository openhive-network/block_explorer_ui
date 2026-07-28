import Hive from "@/types/Hive";
import { derivePendingRewards } from "@/utils/pendingRewards";

const hbd = (amount: string): Hive.Supply => ({
  nai: "@@000000013",
  amount,
  precision: 3,
});

const basis = (
  total: string,
  direct: string,
  liquid: string,
  vesting: string
): Hive.RewardBasis => ({
  total: hbd(total),
  direct: hbd(direct),
  liquid: hbd(liquid),
  vesting: hbd(vesting),
});

// Real testapi payload for @actifit (hivemind-api pending-*-rewards).
const actifitAuthor: Hive.PendingAuthorRewardsResponse = {
  account: "actifit",
  pending_post_count: 659,
  gross_reward_basis: hbd("50"),
  author_reward_basis: basis("25", "0", "12", "13"),
  beneficiaries_reward_basis: basis("0", "0", "0", "0"),
  curators_reward_basis: basis("25", "0", "0", "25"),
};

const actifitCuration: Hive.PendingCurationRewardsResponse = {
  account: "actifit",
  pending_vote_count: 570,
  curation_reward_basis: basis("24113", "0", "0", "24113"),
};

describe("derivePendingRewards", () => {
  it("computes the actifit summary that the card renders", () => {
    const d = derivePendingRewards(actifitAuthor, actifitCuration);

    expect(d.grossHbd).toBeCloseTo(0.05, 6);
    expect(d.authorTotalHbd).toBeCloseTo(0.025, 6);
    expect(d.beneficiariesTotalHbd).toBe(0);
    expect(d.curatorsTotalHbd).toBeCloseTo(0.025, 6);
    expect(d.curationTotalHbd).toBeCloseTo(24.113, 6);

    expect(d.authorPct).toBeCloseTo(50, 6);
    expect(d.beneficiariesPct).toBe(0);
    expect(d.curatorsPct).toBeCloseTo(50, 6);

    expect(d.avgPerPost).toBeCloseTo(0.025 / 659, 9);
    expect(d.avgPerVote).toBeCloseTo(24.113 / 570, 9);

    // Header + "Your take" reflect what the account actually receives, not gross.
    expect(d.yourTakeHbd).toBeCloseTo(24.138, 6);
    expect(d.headlineHbd).toBeCloseTo(24.138, 6);
    expect(d.headlineHbd).toBeLessThan(
      d.grossHbd + d.curationTotalHbd // the old, overstated headline
    );

    expect(d.isAllZero).toBe(false);
  });

  it("splits each receivable into liquid vs HP (vesting)", () => {
    const d = derivePendingRewards(actifitAuthor, actifitCuration);

    // author 0.025 = 0.012 liquid (direct 0 + liquid 12) + 0.013 HP (vesting 13)
    expect(d.authorLiquidHbd).toBeCloseTo(0.012, 6);
    expect(d.authorHpHbd).toBeCloseTo(0.013, 6);

    // curators 0.025 and curation 24.113 are 100% HP (vesting)
    expect(d.curatorsLiquidHbd).toBe(0);
    expect(d.curatorsHpHbd).toBeCloseTo(0.025, 6);
    expect(d.curationLiquidHbd).toBe(0);
    expect(d.curationHpHbd).toBeCloseTo(24.113, 6);

    // your take combines author + curation splits and reconciles to the total
    expect(d.yourTakeLiquidHbd).toBeCloseTo(0.012, 6);
    expect(d.yourTakeHpHbd).toBeCloseTo(24.126, 6);
    expect(d.yourTakeLiquidHbd + d.yourTakeHpHbd).toBeCloseTo(d.yourTakeHbd, 6);
  });

  it("flags isAllZero only when both responses are present and empty", () => {
    const zeroAuthor: Hive.PendingAuthorRewardsResponse = {
      account: "x",
      pending_post_count: 0,
      gross_reward_basis: hbd("0"),
      author_reward_basis: basis("0", "0", "0", "0"),
      beneficiaries_reward_basis: basis("0", "0", "0", "0"),
      curators_reward_basis: basis("0", "0", "0", "0"),
    };
    const zeroCuration: Hive.PendingCurationRewardsResponse = {
      account: "x",
      pending_vote_count: 0,
      curation_reward_basis: basis("0", "0", "0", "0"),
    };

    expect(derivePendingRewards(zeroAuthor, zeroCuration).isAllZero).toBe(true);
  });

  it("returns zeros and no avg when data is missing (loading / unsupported node)", () => {
    const d = derivePendingRewards(undefined, undefined);
    expect(d.grossHbd).toBe(0);
    expect(d.yourTakeHbd).toBe(0);
    expect(d.avgPerPost).toBeNull();
    expect(d.avgPerVote).toBeNull();
    expect(d.isAllZero).toBe(false);
  });

  it("does not report curators as 100% when the gross pie is empty", () => {
    const d = derivePendingRewards(
      {
        account: "x",
        pending_post_count: 0,
        gross_reward_basis: hbd("0"),
        author_reward_basis: basis("0", "0", "0", "0"),
        beneficiaries_reward_basis: basis("0", "0", "0", "0"),
        curators_reward_basis: basis("0", "0", "0", "0"),
      },
      actifitCuration
    );
    expect(d.curatorsPct).toBe(0);
  });
});
