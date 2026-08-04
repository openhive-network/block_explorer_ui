import {
  buildComparisonSections,
  CompareAccountData,
} from "@/utils/compare/rowModel";
import {
  sectionWins,
  winnerOf,
  sparkScale,
  overallWins,
} from "@/utils/compare/scoring";
import {
  buildCompareExportRows,
  buildCompareExportJson,
} from "@/utils/compare/export";
import {
  compareCellPair,
  compareCellText,
  compareSecondaryText,
} from "@/utils/compare/format";
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
  liquidHive: 30_000,
  liquidHiveUsd: 12_000,
  liquidHbd: 30_000,
  liquidHbdUsd: 30_000,
  savingsHive: 50_000,
  savingsHiveUsd: 20_000,
  savingsHbd: 100_000,
  savingsHbdUsd: 100_000,
  reputation: 78,
  topHolderRankHive: null,
  topHolderRankHbd: 40,
  topHolderRankVests: 18,
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
  curationRewardsHpW: 4_100,
  benefactorRewardsHpW: 250,
  benefactorRewardsHbdW: 12,
  producerRewardsHpW: 9_500,
  interestHbdW: 640,
  financialUnavailable: false,
  rewardsPerContentHbdEq: 103,
  votesReceivedPerContent: 342,
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
  liquidHive: 15_000,
  liquidHiveUsd: 6_000,
  liquidHbd: 3_100,
  liquidHbdUsd: 3_100,
  savingsHive: 2_000,
  savingsHiveUsd: 800,
  savingsHbd: 1_500,
  savingsHbdUsd: 1_500,
  reputation: 71,
  topHolderRankHive: 12,
  topHolderRankHbd: null,
  topHolderRankVests: 87,
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
  curationRewardsHpW: 980,
  benefactorRewardsHpW: 40,
  benefactorRewardsHbdW: 3,
  producerRewardsHpW: null,
  interestHbdW: 0,
  financialUnavailable: false,
  rewardsPerContentHbdEq: 103,
  votesReceivedPerContent: 342,
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
      "totalValue",
      "totalHp",
      "effectiveHp",
      "receivedHp",
      "delegatedOutHp",
      "liquidHive",
      "liquidHbd",
      "savingsHive",
      "savingsHbd",
      "reputation",
      "topHolderRankVests",
      "topHolderRankHive",
      "topHolderRankHbd",
    ]);
  });

  it("blanks only the rows whose own source is down", () => {
    const earnings = buildComparisonSections(
      { ...themarkymark, financialUnavailable: true },
      { ...cryptomaria, financialUnavailable: true }
    ).find((s) => s.id === "earnings")!;
    const rowById = (id: string) => earnings.rows.find((r) => r.id === id)!;
    expect(rowById("rewardsPerContent").unavailable).toBe(true);
    expect(rowById("votesReceivedPerContent").unavailable).toBe(false);
  });

  it("matches the demo's section win-counts (Wealth 10·2, Influence 4·1)", () => {
    expect(sectionWins(wealth)).toEqual({ a: 10, b: 2 });
    expect(sectionWins(influence)).toEqual({ a: 4, b: 1 });
  });

  it("received-HP goes to @b, top-holder rank (lower) to @a", () => {
    const received = wealth.rows.find((r) => r.id === "receivedHp")!;
    const rank = wealth.rows.find((r) => r.id === "topHolderRankVests")!;
    expect(winnerOf(received)).toBe("b");
    expect(winnerOf(rank)).toBe("a");
  });

  it("ranks each coin against the same coin, never across coins", () => {
    const vests = wealth.rows.find((r) => r.id === "topHolderRankVests")!;
    const hive = wealth.rows.find((r) => r.id === "topHolderRankHive")!;
    const hbd = wealth.rows.find((r) => r.id === "topHolderRankHbd")!;
    expect([vests.aValue, vests.bValue]).toEqual([18, 87]);
    expect(winnerOf(vests)).toBe("a");
    // Placing beats not placing, but only within the same coin.
    expect([hive.aValue, hive.bValue]).toEqual([null, 12]);
    expect(winnerOf(hive)).toBe("b");
    expect([hbd.aValue, hbd.bValue]).toEqual([40, null]);
    expect(winnerOf(hbd)).toBe("a");
  });

  it("an unplaced side gets no bar, and both unplaced scores nothing", () => {
    const hive = wealth.rows.find((r) => r.id === "topHolderRankHive")!;
    expect(sparkScale(hive)).toEqual({ a: 0, b: 1 });
    const [{ rows }] = buildComparisonSections(
      { ...themarkymark, topHolderRankHive: null },
      { ...cryptomaria, topHolderRankHive: null }
    );
    const none = rows.find((r) => r.id === "topHolderRankHive")!;
    expect(winnerOf(none)).toBeNull();
    expect(sparkScale(none)).toEqual({ a: 0, b: 0 });
  });

  it("flags the top-100 cutoff and renders an outside-top-100 side blank", () => {
    const hive = wealth.rows.find((r) => r.id === "topHolderRankHive")!;
    expect(hive.infoKey).toBe("compare.info.topHolderRank");
    expect(compareCellText(hive, "a", "en", (k) => k)).toBe("—");
    expect(compareCellText(hive, "b", "en", (k) => k)).toBe("#12");
  });

  it("delegated-out is neutral; witness rank is unscored when one side isn't a witness", () => {
    const deleg = wealth.rows.find((r) => r.id === "delegatedOutHp")!;
    const wRank = influence.rows.find((r) => r.id === "witnessRank")!;
    // All three sit out when only one side is a witness.
    const wVotes = influence.rows.find((r) => r.id === "witnessVotes")!;
    const wVoters = influence.rows.find((r) => r.id === "witnessVoters")!;
    expect(winnerOf(wVotes)).toBeNull();
    expect(winnerOf(wVoters)).toBeNull();
    expect(sparkScale(wRank)).toEqual({ a: 0, b: 0 });
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

describe("compare export parity with the rendered table", () => {
  const t = (k: string) => k;
  const sections = buildComparisonSections(themarkymark, cryptomaria);
  const ctx = {
    a: themarkymark,
    b: cryptomaria,
    sections,
    rangeLabel: "compare.window.all",
    locale: "en",
    t,
  };
  const rows = buildCompareExportRows(ctx);
  const aCol = "@themarkymark";
  const bCol = "@cryptomaria";

  it("exports every row of every section, none dropped", () => {
    const total = sections.reduce((n, s) => n + s.rows.length, 0);
    expect(rows).toHaveLength(total);
    expect(total).toBeGreaterThan(0);
  });

  it("exports the same cell text the table renders, row for row", () => {
    const displayed = (row: CompareRow, side: "a" | "b", primary: string) => {
      const sec = compareSecondaryText(row, side, "en");
      return sec ? `${primary} (${sec})` : primary;
    };
    let i = 0;
    for (const section of sections) {
      for (const row of section.rows) {
        const shown = compareCellPair(row, "en", t);
        expect(rows[i][aCol]).toBe(displayed(row, "a", shown.a));
        expect(rows[i][bCol]).toBe(displayed(row, "b", shown.b));
        expect(rows[i]["compare.export.metric"]).toBe(t(row.labelKey));
        expect(rows[i]["compare.export.section"]).toBe(t(section.titleKey));
        i += 1;
      }
    }
  });

  it("winner column agrees with the caret the table draws", () => {
    let i = 0;
    for (const section of sections) {
      for (const row of section.rows) {
        const w = winnerOf(row);
        const expected =
          w === "a"
            ? aCol
            : w === "b"
              ? bCol
              : w === "tie"
                ? "compare.tie"
                : "";
        expect(rows[i]["compare.export.winner"]).toBe(expected);
        i += 1;
      }
    }
  });

  it("JSON export carries raw numbers alongside the display strings", () => {
    const json = buildCompareExportJson(ctx);
    const wealth = json.sections.find((s) => s.id === "wealth")!;
    const totalValue = wealth.rows.find(
      (r) => r.metric === t("compare.rows.totalValue")
    )!;
    expect(totalValue.a).toBe(themarkymark.totalValueUsd);
    expect(totalValue.b).toBe(cryptomaria.totalValueUsd);
    expect(json.overall).toEqual(overallWins(sections));
  });

  it("carries the secondary value into the CSV cell, not just the primary", () => {
    const exported = rows.find(
      (r) => r["compare.export.metric"] === t("compare.rows.liquidHive")
    )!;
    expect(exported[aCol]).toBe("30K HIVE ($12K)");
    expect(exported[bCol]).toBe("15K HIVE ($6K)");
  });

  it("leaves rows without a secondary untouched", () => {
    const exported = rows.find(
      (r) => r["compare.export.metric"] === t("compare.rows.reputation")
    )!;
    expect(exported[aCol]).toBe("78");
    expect(exported[bCol]).toBe("71");
  });

  it("exposes the secondary as a number in the JSON export", () => {
    const json = buildCompareExportJson(ctx);
    const liquid = json.sections
      .find((s) => s.id === "wealth")!
      .rows.find((r) => r.metric === t("compare.rows.liquidHive"))!;
    expect(liquid.aSecondary).toBe(themarkymark.liquidHiveUsd);
    expect(liquid.bSecondary).toBe(cryptomaria.liquidHiveUsd);
    expect(liquid.aSecondaryDisplay).toBe("$12K");
  });
});
