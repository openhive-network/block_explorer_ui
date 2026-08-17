import Hive from "@/types/Hive";
import { CompareRow, CompareSection, ValueFormat } from "./types";
import { WealthComposition } from "./wealth";

export type { WealthComposition };

// Raw, comparable per-account scalars. The data hook (useCompareAccount) fills
// this from the existing account-page hooks; buildComparisonSections shapes two
// of them into the winner-highlight row model. Everything here is pure.
export interface CompareAccountData {
  account: string;
  notFound: boolean;
  isLoading: boolean;
  // Header stats (rendered in the sticky header, not table rows).
  totalValueUsd: number | null;
  createdMs: number | null;
  followers: number | null;
  lifetimePosts: number | null;
  lastPostMs: number | null;
  // 💰 Wealth & Stake
  totalHp: number | null;
  effectiveHp: number | null;
  receivedHp: number | null;
  delegatedOutHp: number | null;
  // Savings includes the pending (withdrawing) amount.
  liquidHive: number | null;
  liquidHiveUsd: number | null;
  liquidHbd: number | null;
  liquidHbdUsd: number | null;
  savingsHive: number | null;
  savingsHiveUsd: number | null;
  savingsHbd: number | null;
  savingsHbdUsd: number | null;
  reputation: number | null;
  // null means outside that coin's top 100.
  topHolderRankHive: number | null;
  topHolderRankHbd: number | null;
  topHolderRankVests: number | null;
  // Full USD segment breakdown for the wealth-composition "wallet chart".
  wealthComposition: WealthComposition | null;
  // 🕸️ Influence & Governance
  incomingDelegationsCount: number | null;
  incomingDelegationsHp: number | null;
  incomingRcDelegationsCount: number | null;
  outgoingRcDelegationsCount: number | null;
  proxyPowerHp: number | null;
  witnessesVotedFor: number | null;
  proposalVotesCast: number | null;
  isWitness: boolean;
  witnessRank: number | null;
  witnessVoteWeightHp: number | null;
  witnessVoters: number | null;
  govVoteExpirationMs: number | null;
  // Activity & Content (windowed; content-stats + dapp-footprint, node-gated)
  postsW: number | null;
  commentsW: number | null;
  repliesReceivedW: number | null;
  votesCastW: number | null;
  votesReceivedW: number | null;
  contentUnavailable: boolean;
  totalOpsW: number | null;
  topDapp: string | null;
  topCategory: string | null;
  // Full category distribution for the footprint donut small-multiple.
  dappCategories: Hive.AccountDappFootprintCategory[] | null;
  dappUnavailable: boolean;
  // Earnings (windowed; content-stats rewards, node-gated)
  authorRewardsHbdW: number | null;
  authorRewardsHiveW: number | null;
  authorRewardsHpW: number | null;
  curationRewardsHpW: number | null;
  benefactorRewardsHpW: number | null;
  benefactorRewardsHbdW: number | null;
  // null for non-witnesses, so the row shows but never scores.
  producerRewardsHpW: number | null;
  interestHbdW: number | null;
  financialUnavailable: boolean;
  // Per post or comment, in HBD-equivalent across all three payout currencies.
  rewardsPerContentHbdEq: number | null;
  votesReceivedPerContent: number | null;
  // Resources & Momentum
  poweredUpHp: number | null;
  powerDownHp: number | null;
  netHpFlow: number | null;
  vestingUnavailable: boolean;
  rcPct: number | null;
  votingManaPct: number | null;
}

const row = (
  id: string,
  format: ValueFormat,
  aValue: number | null,
  bValue: number | null,
  opts?: Partial<CompareRow>
): CompareRow => ({
  id,
  labelKey: `compare.rows.${id}`,
  format,
  scored: true,
  aValue,
  bValue,
  ...opts,
});

const TOP_RANK_OPTS: Partial<CompareRow> = {
  lowerWins: true,
  subLabelKey: "compare.sub.lowerBetter",
  infoKey: "compare.info.topHolderRank",
  nullMeansWorst: true,
};

const GOV_HEALTH_WINDOW_MS = 30 * 24 * 3600 * 1000;

// Bucketed, not compared as a raw date: two accounts that both read "Active"
// must tie rather than split on a timestamp the table never shows.
export const govHealth = (
  ms: number | null
): { rank: number | null; key?: string } => {
  if (ms === null) return { rank: null };
  const remaining = ms - Date.now();
  if (remaining <= 0) return { rank: 0, key: "compare.health.expired" };
  if (remaining <= GOV_HEALTH_WINDOW_MS)
    return { rank: 1, key: "compare.health.expiring" };
  return { rank: 2, key: "compare.health.active" };
};

export const buildComparisonSections = (
  a: CompareAccountData,
  b: CompareAccountData
): CompareSection[] => {
  const wealth: CompareSection = {
    id: "wealth",
    titleKey: "compare.sections.wealth",
    rows: [
      row("totalValue", "usd", a.totalValueUsd, b.totalValueUsd, {
        infoKey: "compare.info.totalValue",
      }),
      row("totalHp", "hp", a.totalHp, b.totalHp),
      row("effectiveHp", "hp", a.effectiveHp, b.effectiveHp, {
        subLabelKey: "compare.sub.inclDelegatedIn",
      }),
      row("receivedHp", "hp", a.receivedHp, b.receivedHp),
      row("delegatedOutHp", "hp", a.delegatedOutHp, b.delegatedOutHp, {
        scored: false,
      }),
      row("liquidHive", "hive", a.liquidHive, b.liquidHive, {
        aSecondary: a.liquidHiveUsd,
        bSecondary: b.liquidHiveUsd,
        secondaryFormat: "usd",
      }),
      row("liquidHbd", "hbd", a.liquidHbd, b.liquidHbd, {
        aSecondary: a.liquidHbdUsd,
        bSecondary: b.liquidHbdUsd,
        secondaryFormat: "usd",
      }),
      row("savingsHive", "hive", a.savingsHive, b.savingsHive, {
        aSecondary: a.savingsHiveUsd,
        bSecondary: b.savingsHiveUsd,
        secondaryFormat: "usd",
      }),
      row("savingsHbd", "hbd", a.savingsHbd, b.savingsHbd, {
        aSecondary: a.savingsHbdUsd,
        bSecondary: b.savingsHbdUsd,
        secondaryFormat: "usd",
      }),
      row("reputation", "reputation", a.reputation, b.reputation),
      row(
        "topHolderRankVests",
        "rank",
        a.topHolderRankVests,
        b.topHolderRankVests,
        TOP_RANK_OPTS
      ),
      row(
        "topHolderRankHive",
        "rank",
        a.topHolderRankHive,
        b.topHolderRankHive,
        TOP_RANK_OPTS
      ),
      row(
        "topHolderRankHbd",
        "rank",
        a.topHolderRankHbd,
        b.topHolderRankHbd,
        TOP_RANK_OPTS
      ),
    ],
  };

  const aGov = govHealth(a.govVoteExpirationMs);
  const bGov = govHealth(b.govVoteExpirationMs);

  const influence: CompareSection = {
    id: "influence",
    titleKey: "compare.sections.influence",
    rows: [
      row(
        "incomingDelegations",
        "number",
        a.incomingDelegationsCount,
        b.incomingDelegationsCount,
        {
          subLabelKey: "compare.sub.backers",
          aSecondary: a.incomingDelegationsHp,
          bSecondary: b.incomingDelegationsHp,
          secondaryFormat: "hp",
        }
      ),
      // RC delegations — counts only; shown, not scored (more isn't "better").
      row(
        "incomingRcDelegations",
        "number",
        a.incomingRcDelegationsCount,
        b.incomingRcDelegationsCount,
        { scored: false }
      ),
      row(
        "outgoingRcDelegations",
        "number",
        a.outgoingRcDelegationsCount,
        b.outgoingRcDelegationsCount,
        { scored: false }
      ),
      row("proxyPower", "hp", a.proxyPowerHp, b.proxyPowerHp),
      row(
        "witnessesVotedFor",
        "number",
        a.witnessesVotedFor,
        b.witnessesVotedFor
      ),
      row("proposalVotes", "number", a.proposalVotesCast, b.proposalVotesCast),
      // Only scored when both are witnesses — otherwise the missing side is null
      // and winnerOf treats the row as unscored.
      row(
        "witnessRank",
        "rank",
        a.isWitness ? a.witnessRank : null,
        b.isWitness ? b.witnessRank : null,
        { lowerWins: true }
      ),
      // Witness-only: vote weight (HP) and number of voters.
      row("witnessVotes", "hp", a.witnessVoteWeightHp, b.witnessVoteWeightHp),
      row("witnessVoters", "number", a.witnessVoters, b.witnessVoters),
      // Governance-vote health: Active > Expiring > Expired.
      row("govVoteHealth", "text", aGov.rank, bGov.rank, {
        aDisplayKey: aGov.key,
        bDisplayKey: bGov.key,
      }),
    ],
  };

  const contentNA = a.contentUnavailable || b.contentUnavailable;
  const dappNA = a.dappUnavailable || b.dappUnavailable;

  const activity: CompareSection = {
    id: "activity",
    titleKey: "compare.sections.activity",
    windowed: true,
    rows: [
      row("posts", "number", a.postsW, b.postsW, { unavailable: contentNA }),
      row("comments", "number", a.commentsW, b.commentsW, {
        unavailable: contentNA,
      }),
      row("repliesReceived", "number", a.repliesReceivedW, b.repliesReceivedW, {
        unavailable: contentNA,
      }),
      row("votesCast", "number", a.votesCastW, b.votesCastW, {
        unavailable: contentNA,
      }),
      row("votesReceived", "number", a.votesReceivedW, b.votesReceivedW, {
        unavailable: contentNA,
      }),
      // Account age & last active are instant; age is neutral, last active
      // scores on recency (later timestamp wins).
      row("accountAge", "date", a.createdMs, b.createdMs, { scored: false }),
      row("lastActive", "date", a.lastPostMs, b.lastPostMs),
      row("totalOps", "number", a.totalOpsW, b.totalOpsW, {
        scored: false,
        infoKey: "compare.info.totalOps",
        unavailable: dappNA,
      }),
      row("topDapp", "text", null, null, {
        scored: false,
        unavailable: dappNA,
        aDisplay: a.topDapp ?? undefined,
        bDisplay: b.topDapp ?? undefined,
      }),
      row("topCategory", "text", null, null, {
        scored: false,
        unavailable: dappNA,
        aDisplay: a.topCategory ?? undefined,
        bDisplay: b.topCategory ?? undefined,
      }),
    ],
  };

  const finNA = a.financialUnavailable || b.financialUnavailable;

  const earnings: CompareSection = {
    id: "earnings",
    titleKey: "compare.sections.earnings",
    windowed: true,
    rows: [
      row("authorRewardsHbd", "hbd", a.authorRewardsHbdW, b.authorRewardsHbdW, {
        unavailable: finNA,
      }),
      row("authorRewardsHp", "hp", a.authorRewardsHpW, b.authorRewardsHpW, {
        unavailable: finNA,
      }),
      row(
        "authorRewardsHive",
        "hive",
        a.authorRewardsHiveW,
        b.authorRewardsHiveW,
        { unavailable: finNA }
      ),
      row(
        "curationRewardsHp",
        "hp",
        a.curationRewardsHpW,
        b.curationRewardsHpW,
        {
          unavailable: finNA,
        }
      ),
      row(
        "benefactorRewardsHp",
        "hp",
        a.benefactorRewardsHpW,
        b.benefactorRewardsHpW,
        {
          infoKey: "compare.info.benefactorRewards",
          aSecondary: a.benefactorRewardsHbdW,
          bSecondary: b.benefactorRewardsHbdW,
          secondaryFormat: "hbd",
          unavailable: finNA,
        }
      ),
      row(
        "producerRewardsHp",
        "hp",
        a.producerRewardsHpW,
        b.producerRewardsHpW,
        { infoKey: "compare.info.producerRewards", unavailable: finNA }
      ),
      row("interestHbd", "hbd", a.interestHbdW, b.interestHbdW, {
        infoKey: "compare.info.interest",
        unavailable: finNA,
      }),
      row(
        "rewardsPerContent",
        "hbd",
        a.rewardsPerContentHbdEq,
        b.rewardsPerContentHbdEq,
        {
          infoKey: "compare.info.rewardsPerContent",
          // Rewards come from the financial summary, the denominator from content stats.
          unavailable: finNA || contentNA,
        }
      ),
      row(
        "votesReceivedPerContent",
        "number",
        a.votesReceivedPerContent,
        b.votesReceivedPerContent,
        { unavailable: contentNA }
      ),
    ],
  };

  const vestingNA = a.vestingUnavailable || b.vestingUnavailable;

  const resources: CompareSection = {
    id: "resources",
    titleKey: "compare.sections.resources",
    windowed: true,
    rows: [
      row("netHpFlow", "hp", a.netHpFlow, b.netHpFlow, {
        unavailable: vestingNA,
      }),
      row("poweredUp", "hp", a.poweredUpHp, b.poweredUpHp, {
        unavailable: vestingNA,
      }),
      row("powerDown", "hp", a.powerDownHp, b.powerDownHp, {
        lowerWins: true,
        subLabelKey: "compare.sub.lowerBetter",
        unavailable: vestingNA,
      }),
      // Instant momentary gauges — shown, not scored.
      row("rcAvailable", "percent", a.rcPct, b.rcPct, { scored: false }),
      row("votingMana", "percent", a.votingManaPct, b.votingManaPct, {
        scored: false,
      }),
    ],
  };

  return [wealth, influence, activity, earnings, resources];
};
