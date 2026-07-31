import {
  buildComparisonSections,
  CompareAccountData,
} from "@/utils/compare/rowModel";
import { sectionWins, winnerOf } from "@/utils/compare/scoring";
import { compareCellPair, compareCellText } from "@/utils/compare/format";
import { CompareRow } from "@/utils/compare/types";

const DAY = 24 * 3600 * 1000;
// Governance health is bucketed against "now", so the fixtures are anchored to
// it: @a stays Active, @b falls inside the 30-day Expiring window.
const NOW = Date.now();

// Numbers taken from the demo PDF (@themarkymark vs @cryptomaria).
const themarkymark: CompareAccountData = {
  account: "themarkymark",
  notFound: false,
  isLoading: false,
  totalValueUsd: 1_240_000,
  createdMs: 1_467_331_200_000,
  followers: 20_600,
  lifetimePosts: 3_120,
  lastPostMs: 1_700_000_000_000,
  totalHp: 1_240_000,
  effectiveHp: 1_310_000,
  receivedHp: 70_000,
  delegatedOutHp: 0,
  liquidUsd: 42_000,
  savingsUsd: 120_000,
  reputation: 78,
  topHolderRank: 182,
  wealthComposition: {
    staked: 1_078_000,
    liquid: 42_000,
    savings: 120_000,
    unclaimed: 0,
    openOrders: 0,
    locked: 0,
    escrow: 0,
    poweringDown: 0,
  },
  incomingDelegationsCount: 14,
  incomingDelegationsHp: 2_100_000,
  incomingRcDelegationsCount: 40,
  outgoingRcDelegationsCount: 3,
  proxyPowerHp: 2_100_000,
  witnessesVotedFor: 30,
  proposalVotesCast: 45,
  isWitness: true,
  witnessRank: 18,
  witnessVoteWeightHp: 5_000_000,
  witnessVoters: 2_900,
  govVoteExpirationMs: NOW + 365 * DAY, // Active
  postsW: 12,
  commentsW: 88,
  repliesReceivedW: 140,
  votesCastW: 200,
  votesReceivedW: 4100,
  contentUnavailable: false,
  totalOpsW: 1240,
  topDapp: "Ecency",
  topCategory: "Social",
  dappCategories: null,
  dappUnavailable: false,
  authorRewardsHbdW: 1240,
  authorRewardsHiveW: 103,
  authorRewardsHpW: 320,
  rewardsPerPostHbd: 103,
  votesReceivedPerPost: 342,
  poweredUpHp: 5000,
  powerDownHp: 800,
  netHpFlow: 4200,
  vestingUnavailable: false,
  rcPct: 96,
  votingManaPct: 88,
};

const cryptomaria: CompareAccountData = {
  account: "cryptomaria",
  notFound: false,
  isLoading: false,
  totalValueUsd: 286_000,
  createdMs: 1_520_000_000_000,
  followers: 4_100,
  lifetimePosts: 890,
  lastPostMs: 1_700_000_500_000,
  totalHp: 512_000,
  effectiveHp: 640_000,
  receivedHp: 160_000,
  delegatedOutHp: 8_000,
  liquidUsd: 9_100,
  savingsUsd: 2_300,
  reputation: 71,
  topHolderRank: 1_204,
  wealthComposition: {
    staked: 274_600,
    liquid: 9_100,
    savings: 2_300,
    unclaimed: 0,
    openOrders: 0,
    locked: 0,
    escrow: 0,
    poweringDown: 0,
  },
  incomingDelegationsCount: 63,
  incomingDelegationsHp: 0,
  incomingRcDelegationsCount: 12,
  outgoingRcDelegationsCount: 0,
  proxyPowerHp: 0,
  witnessesVotedFor: 8,
  proposalVotesCast: 0,
  isWitness: false,
  witnessRank: null,
  witnessVoteWeightHp: null,
  witnessVoters: null,
  govVoteExpirationMs: NOW + 10 * DAY, // Expiring
  postsW: 41,
  commentsW: 210,
  repliesReceivedW: 320,
  votesCastW: 1850,
  votesReceivedW: 6200,
  contentUnavailable: false,
  totalOpsW: 3900,
  topDapp: "PeakD",
  topCategory: "Gaming",
  dappCategories: null,
  dappUnavailable: false,
  authorRewardsHbdW: 1240,
  authorRewardsHiveW: 103,
  authorRewardsHpW: 320,
  rewardsPerPostHbd: 103,
  votesReceivedPerPost: 342,
  poweredUpHp: 5000,
  powerDownHp: 800,
  netHpFlow: 4200,
  vestingUnavailable: false,
  rcPct: 96,
  votingManaPct: 88,
};

describe("buildComparisonSections", () => {
  const [wealth, influence] = buildComparisonSections(
    themarkymark,
    cryptomaria
  );

  it("produces the two Phase-1 sections with the demo's rows", () => {
    expect(wealth.id).toBe("wealth");
    expect(influence.id).toBe("influence");
    expect(wealth.rows.map((r) => r.id)).toEqual([
      "totalHp",
      "effectiveHp",
      "receivedHp",
      "delegatedOutHp",
      "liquid",
      "savings",
      "reputation",
      "topHolderRank",
    ]);
  });

  it("matches the demo's section win-counts (Wealth 6·1, Influence 4·1)", () => {
    expect(sectionWins(wealth)).toEqual({ a: 6, b: 1 });
    expect(sectionWins(influence)).toEqual({ a: 4, b: 1 });
  });

  it("received-HP goes to @b, top-holder rank (lower) to @a", () => {
    const received = wealth.rows.find((r) => r.id === "receivedHp")!;
    const rank = wealth.rows.find((r) => r.id === "topHolderRank")!;
    expect(winnerOf(received)).toBe("b");
    expect(winnerOf(rank)).toBe("a");
  });

  it("delegated-out is neutral; witness rank is unscored when one side isn't a witness", () => {
    const deleg = wealth.rows.find((r) => r.id === "delegatedOutHp")!;
    const wRank = influence.rows.find((r) => r.id === "witnessRank")!;
    expect(deleg.scored).toBe(false);
    expect(winnerOf(wRank)).toBeNull();
  });

  it("carries delegated-in HP as the secondary under the backer count", () => {
    const incoming = influence.rows.find(
      (r) => r.id === "incomingDelegations"
    )!;
    expect(incoming.aSecondary).toBe(2_100_000);
    expect(incoming.secondaryFormat).toBe("hp");
  });
});

describe("governance-vote health", () => {
  const t = (k: string) => k;
  const at = (govVoteExpirationMs: number | null): CompareAccountData => ({
    ...themarkymark,
    govVoteExpirationMs,
  });
  const govRow = (aMs: number | null, bMs: number | null) =>
    buildComparisonSections(at(aMs), at(bMs))[1].rows.find(
      (r) => r.id === "govVoteHealth"
    )!;

  it("is scored on the bucket, so two Active accounts tie", () => {
    const row = govRow(NOW + 365 * DAY, NOW + 200 * DAY);
    expect(winnerOf(row)).toBe("tie");
  });

  it("ranks Active over Expiring over Expired", () => {
    expect(winnerOf(govRow(NOW + 365 * DAY, NOW + 10 * DAY))).toBe("a");
    expect(winnerOf(govRow(NOW - DAY, NOW + 10 * DAY))).toBe("b");
  });

  it("renders the bucket label rather than a raw date", () => {
    const row = govRow(NOW + 365 * DAY, NOW - DAY);
    expect(compareCellText(row, "a", "en", t)).toBe("compare.health.active");
    expect(compareCellText(row, "b", "en", t)).toBe("compare.health.expired");
  });

  it("is unscorable when an expiration is missing", () => {
    expect(winnerOf(govRow(NOW + 365 * DAY, null))).toBeNull();
  });
});

describe("compareCellPair", () => {
  const t = (k: string) => k;
  const cell = (over: Partial<CompareRow>): CompareRow => ({
    id: "r",
    labelKey: "k",
    format: "hbd",
    scored: true,
    aValue: null,
    bValue: null,
    ...over,
  });

  // A caret next to two identical-looking numbers reads as a rendering bug.
  it("spells values out when compact formatting collapses them together", () => {
    const { a, b } = compareCellPair(
      cell({ aValue: 12.6, bValue: 12.7 }),
      "en",
      t
    );
    expect(a).not.toBe(b);
    expect(a).toBe("12.6 HBD");
    expect(b).toBe("12.7 HBD");
  });

  it("escalates above 1000 too", () => {
    const { a, b } = compareCellPair(
      cell({ format: "number", aValue: 45_190, bValue: 45_240 }),
      "en",
      t
    );
    expect(a).not.toBe(b);
  });

  it("stays compact when the two sides already read differently", () => {
    const { a, b } = compareCellPair(
      cell({ format: "hp", aValue: 1_240_000, bValue: 512_000 }),
      "en",
      t
    );
    expect(a).toBe("1.24M HP");
    expect(b).toBe("512K HP");
  });

  it("leaves a genuine tie reading identically", () => {
    const { a, b } = compareCellPair(cell({ aValue: 42, bValue: 42 }), "en", t);
    expect(a).toBe(b);
  });

  // No caret on an unscored row, so identical text is honest — don't blow it up
  // into absolute timestamps for nothing.
  it("does not escalate an unscored row", () => {
    const row = cell({ format: "date", aValue: 1, bValue: 2, scored: false });
    const { a, b } = compareCellPair(row, "en", t);
    expect(a).toBe(b);
  });

  it("falls back to an absolute timestamp when two dates read alike", () => {
    const now = Date.now();
    const row = cell({
      format: "date",
      aValue: now - 1000,
      bValue: now - 2000,
    });
    expect(compareCellText(row, "a", "en", t)).toBe(
      compareCellText(row, "b", "en", t)
    );
    const { a, b } = compareCellPair(row, "en", t);
    expect(a).not.toBe(b);
  });

  it("does not escalate categorical rows", () => {
    const row = cell({
      format: "text",
      aValue: 2,
      bValue: 1,
      aDisplayKey: "compare.health.active",
      bDisplayKey: "compare.health.expiring",
    });
    expect(compareCellPair(row, "en", t)).toEqual({
      a: "compare.health.active",
      b: "compare.health.expiring",
    });
  });

  it("renders both sides as Unavailable on a gated row", () => {
    const row = cell({ aValue: 5, bValue: 9, unavailable: true });
    expect(compareCellText(row, "a", "en", t)).toBe("compare.unavailable");
    expect(compareCellPair(row, "en", t).b).toBe("compare.unavailable");
  });
});
