import { useMemo } from "react";

import { useHiveChainContext } from "@/contexts/HiveChainContext";
import useConvertedAccountDetails from "@/hooks/common/useConvertedAccountDetails";
import useAccountDetails from "@/hooks/api/accountPage/useAccountDetails";
import useAccountTopHolderRank from "@/hooks/api/common/useAccountTopHolderRank";
import useProxyPower from "@/hooks/api/accountPage/useProxyPower";
import useProposalVoteCount from "@/hooks/api/accountPage/useProposalVoteCount";
import useWitnessDetails from "@/hooks/api/common/useWitnessDetails";
import useConvertedVestingShares from "@/hooks/common/useConvertedVestingShares";
import useAccountContentStats from "@/hooks/api/accountPage/useAccountContentStats";
import useFinancialSummary from "@/hooks/api/accountPage/useFinancialSummary";
import useAccountDappFootprint from "@/hooks/api/accountPage/useAccountDappFootprint";
import useAccountVestingStats from "@/hooks/api/accountPage/useAccountVestingStats";
import useManabars from "@/hooks/api/accountPage/useManabars";
import useRcDelegations from "@/hooks/api/common/useRcDelegations";
import { convertVestsToHP } from "@/utils/Calculations";
import { grabNumericValue } from "@/utils/StringUtils";
import { config } from "@/Config";
import Explorer from "@/types/Explorer";
import Hive from "@/types/Hive";
import { CompareAccountData } from "@/utils/compare/rowModel";
import { CompareRange, rangeToWindow } from "@/utils/compare/range";
import { buildWealthComposition } from "@/utils/compare/wealth";

const num = (s: unknown): number =>
  s !== undefined && s !== null ? grabNumericValue(String(s)) : 0;

// A nai asset { amount, precision } → float (e.g. power_up_hive → HIVE).
const naiToFloat = (a?: Hive.Supply | null): number =>
  a ? parseFloat(a.amount) / Math.pow(10, a.precision) : 0;

const emptyData = (
  account: string,
  notFound: boolean,
  isLoading: boolean
): CompareAccountData => ({
  account,
  notFound,
  isLoading,
  totalValueUsd: null,
  createdMs: null,
  followers: null,
  lifetimePosts: null,
  lastPostMs: null,
  totalHp: null,
  effectiveHp: null,
  receivedHp: null,
  delegatedOutHp: null,
  liquidHive: null,
  liquidHiveUsd: null,
  liquidHbd: null,
  liquidHbdUsd: null,
  savingsHive: null,
  savingsHiveUsd: null,
  savingsHbd: null,
  savingsHbdUsd: null,
  reputation: null,
  topHolderRankHive: null,
  topHolderRankHbd: null,
  topHolderRankVests: null,
  wealthComposition: null,
  incomingDelegationsCount: null,
  incomingDelegationsHp: null,
  incomingRcDelegationsCount: null,
  outgoingRcDelegationsCount: null,
  proxyPowerHp: null,
  witnessesVotedFor: null,
  proposalVotesCast: null,
  isWitness: false,
  witnessRank: null,
  witnessVoteWeightHp: null,
  witnessVoters: null,
  govVoteExpirationMs: null,
  postsW: null,
  commentsW: null,
  repliesReceivedW: null,
  votesCastW: null,
  votesReceivedW: null,
  contentUnavailable: false,
  totalOpsW: null,
  topDapp: null,
  topCategory: null,
  dappCategories: null,
  dappUnavailable: false,
  authorRewardsHbdW: null,
  authorRewardsHiveW: null,
  authorRewardsHpW: null,
  curationRewardsHpW: null,
  benefactorRewardsHpW: null,
  benefactorRewardsHbdW: null,
  producerRewardsHpW: null,
  interestHbdW: null,
  financialUnavailable: false,
  rewardsPerContentHbdEq: null,
  votesReceivedPerContent: null,
  poweredUpHp: null,
  powerDownHp: null,
  netHpFlow: null,
  vestingUnavailable: false,
  rcPct: null,
  votingManaPct: null,
});

// Fans out the instant, always-available account-page hooks for one account and
// reduces them to the raw comparable scalars the row model needs.
const useCompareAccount = (
  accountName: string,
  range: CompareRange,
  dynamicGlobalData?: Explorer.HeadBlockCardData
): CompareAccountData => {
  const { hiveChain } = useHiveChainContext();
  // The picker renders with accountName "" — every query below must stay idle
  // until a pair is chosen, since an empty name is not a valid request.
  const hasAccount = !!accountName;
  // Memoized so the window's Dates (and thus the query keys) are stable.
  const win = useMemo(() => rangeToWindow(range), [range]);
  const { formattedAccountDetails, notFound, isAccountDetailsLoading } =
    useConvertedAccountDetails(accountName, false, dynamicGlobalData);
  const isWitness = !!(
    formattedAccountDetails as { is_witness?: boolean } | undefined
  )?.is_witness;

  // Cache-deduped with the call inside useConvertedAccountDetails; gives the raw
  // created timestamp for account age.
  const { accountDetails: rawDetails } = useAccountDetails(accountName, false);
  const { entries: rankEntries } = useAccountTopHolderRank(accountName);
  const { accountProxyPower } = useProxyPower(
    accountName,
    1,
    undefined,
    undefined,
    hasAccount
  );
  const { voteCount } = useProposalVoteCount(accountName);
  const { witnessDetails } = useWitnessDetails(accountName, isWitness);
  const incoming = useConvertedVestingShares(
    "incoming",
    accountName,
    false,
    dynamicGlobalData,
    hasAccount
  );

  // Windowed, node-gated sources (degrade to "Unavailable" via isError).
  const {
    accountContentStats,
    isAccountContentStatsLoading,
    isAccountContentStatsError,
  } = useAccountContentStats(
    accountName,
    win.granularity,
    win.fromDate,
    win.toDate
  );
  const {
    data: financialSummary,
    isLoading: isFinancialSummaryLoading,
    isError: isFinancialSummaryError,
  } = useFinancialSummary(
    accountName,
    win.fromDate.toISOString().slice(0, 10),
    win.toDate.toISOString().slice(0, 10),
    win.granularity
  );
  const { dappFootprint, isDappFootprintLoading, isDappFootprintError } =
    useAccountDappFootprint(accountName, win.fromDate, win.toDate);
  const {
    accountVestingStats,
    isAccountVestingStatsLoading,
    isAccountVestingStatsError,
  } = useAccountVestingStats(
    accountName,
    win.granularity === "month" ? "monthly" : "daily",
    win.fromDate,
    win.toDate
  );
  const { manabarsData } = useManabars(accountName, false);
  const { incomingRcDelegations, outgoingRcDelegations } = useRcDelegations(
    accountName,
    false,
    hasAccount
  );

  // useConvertedVestingShares rebuilds its array every render, so reduce it to
  // scalars here — passing the array into the memo below would defeat the cache.
  const incomingDelegationsCount = incoming ? incoming.length : null;
  const incomingDelegationsHp = incoming
    ? incoming.reduce((sum, d) => sum + num(d.vesting_shares), 0)
    : null;
  const incomingRcDelegationsCount = incomingRcDelegations
    ? incomingRcDelegations.length
    : null;
  const outgoingRcDelegationsCount = outgoingRcDelegations
    ? outgoingRcDelegations.length
    : null;

  // Details resolve before the chain data needed to format them, so "not
  // loading" alone would flash a fully empty comparison.
  const isLoading =
    isAccountDetailsLoading || (!notFound && !formattedAccountDetails);

  return useMemo(() => {
    if (!formattedAccountDetails) {
      return emptyData(accountName, !!notFound, isLoading);
    }
    const fad = formattedAccountDetails as unknown as Record<string, unknown>;
    const dollars = (fad.dollars ?? {}) as Record<string, unknown>;

    const g = dynamicGlobalData?.headBlockDetails;
    const canConvert =
      !!hiveChain && !!g?.rawTotalVestingFundHive && !!g?.rawTotalVestingShares;
    const toHp = (vests?: string): number => {
      if (!canConvert || !vests) return 0;
      try {
        const s = convertVestsToHP(
          hiveChain!,
          vests,
          g!.rawTotalVestingFundHive,
          g!.rawTotalVestingShares
        );
        return s ? grabNumericValue(s) : 0;
      } catch {
        return 0;
      }
    };
    const totalHp = num(fad.vesting_shares);
    const receivedHp = num(fad.received_vesting_shares);
    const delegatedOutHp = num(fad.delegated_vesting_shares);

    const rankOf = (coin: "HIVE" | "HBD" | "VESTS"): number | null =>
      rankEntries?.find((e) => e.coinType === coin)?.rank ?? null;

    const proxyPowerHp = accountProxyPower
      ? accountProxyPower.reduce((sum, p) => sum + toHp(p.proxied_vests), 0)
      : null;

    const govRaw = fad.governance_vote_expiration_ts;
    const govParsed = govRaw ? new Date(govRaw as string).getTime() : NaN;
    // Never-voted accounts report the 1970 epoch here — treat as "no vote" (null)
    // rather than a real "Expired" governance status that would lose the row.
    const govMs =
      isFinite(govParsed) && new Date(govParsed).getUTCFullYear() > 2000
        ? govParsed
        : NaN;

    const createdRaw = rawDetails?.created
      ? new Date(rawDetails.created).getTime()
      : NaN;

    const lastPostParsed = fad.last_post
      ? new Date(fad.last_post as string | number | Date).getTime()
      : NaN;
    // Never-posted accounts report the 1970 epoch for last_post — treat that as
    // "no activity" (null) instead of rendering a bogus "57 years ago".
    const lastPostRaw =
      isFinite(lastPostParsed) &&
      new Date(lastPostParsed).getUTCFullYear() > 2000
        ? lastPostParsed
        : NaN;

    // A registered witness that has deactivated uses the null signing key — treat
    // it as a non-witness (no rank, no "Witness #N"), matching the account page.
    const signingKey = (witnessDetails as { signing_key?: string } | undefined)
      ?.signing_key;
    const isActiveWitness =
      isWitness && !!signingKey && signingKey !== config.inactiveWitnessKey;

    // Sum a content-stats field across the windowed series (null when absent).
    const sumCs = (
      pick: (r: Hive.AccountContentStatsResponse) => number
    ): number | null =>
      accountContentStats
        ? accountContentStats.reduce((s, r) => s + (pick(r) || 0), 0)
        : null;
    const contentUnavailable =
      isAccountContentStatsError && !isAccountContentStatsLoading;
    const dappUnavailable = isDappFootprintError && !isDappFootprintLoading;

    // claim_reward_balance_operation is deliberately never summed — it is the
    // claim of rewards already counted by category, so it would double them.
    const sumFs = (
      category: string,
      field: "hive_nai" | "hbd_nai" | "vests_nai"
    ): number | null =>
      financialSummary
        ? financialSummary.reduce(
            (s, r) =>
              r.direction === "incoming" && r.category === category
                ? s + (Number(r[field]) || 0)
                : s,
            0
          )
        : null;
    const financialUnavailable =
      isFinancialSummaryError && !isFinancialSummaryLoading;

    // HBD/HIVE are precision-3 nai; VESTS is precision-6.
    const asCoin = (v: number | null): number | null =>
      v == null ? null : v / 1000;
    const asHp = (v: number | null): number | null =>
      v == null ? null : toHp(String(v));

    const authorRewardsHbdW = asCoin(
      sumFs("author_reward_operation", "hbd_nai")
    );
    const authorRewardsHiveW = asCoin(
      sumFs("author_reward_operation", "hive_nai")
    );
    const authorRewardsHpW = asHp(
      sumFs("author_reward_operation", "vests_nai")
    );
    const curationRewardsHpW = asHp(
      sumFs("curation_reward_operation", "vests_nai")
    );
    const benefactorRewardsHpW = asHp(
      sumFs("comment_benefactor_reward_operation", "vests_nai")
    );
    const benefactorRewardsHbdW = asCoin(
      sumFs("comment_benefactor_reward_operation", "hbd_nai")
    );
    // null, not 0, so a non-witness leaves the row unscored.
    const producerRewardsHpW = isActiveWitness
      ? asHp(sumFs("producer_reward_operation", "vests_nai"))
      : null;
    const interestHbdW = asCoin(sumFs("interest_operation", "hbd_nai"));

    // Median feed is base HBD over quote HIVE.
    const hbdPerHive =
      g?.rawFeedPrice && g?.rawQuote
        ? naiToFloat(g.rawFeedPrice) / (naiToFloat(g.rawQuote) || 1)
        : null;
    const authorRewardsHbdEq =
      hbdPerHive == null
        ? null
        : (authorRewardsHbdW ?? 0) +
          ((authorRewardsHiveW ?? 0) + (authorRewardsHpW ?? 0)) * hbdPerHive;

    // Author rewards accrue on comments too, so the denominator is both.
    const postsWin = sumCs((r) => r.posts);
    const commentsWin = sumCs((r) => r.comments);
    const contentWin =
      postsWin == null && commentsWin == null
        ? null
        : (postsWin ?? 0) + (commentsWin ?? 0);
    const votesRecWin = sumCs((r) => r.votes_received);
    const perContent = (v: number | null): number | null =>
      v != null && contentWin && contentWin > 0 ? v / contentWin : null;

    // ⚡ Resources & Momentum — windowed power up/down (HIVE == HP for flow).
    const vsSum = (
      pick: (r: Hive.AccountVestingStatsResponse) => Hive.Supply | null
    ): number | null =>
      accountVestingStats
        ? accountVestingStats.reduce((s, r) => s + naiToFloat(pick(r)), 0)
        : null;
    const poweredUpHp = vsSum((r) => r.power_up_hive);
    const powerDownHp = vsSum((r) => r.power_down_fill_hive);
    const vestingUnavailable =
      isAccountVestingStatsError && !isAccountVestingStatsLoading;

    return {
      account: accountName,
      notFound: !!notFound,
      isLoading,
      totalValueUsd: num(dollars.account_value) || null,
      createdMs: isFinite(createdRaw) ? createdRaw : null,
      followers: fad.follower_count != null ? Number(fad.follower_count) : null,
      lifetimePosts: fad.post_count != null ? Number(fad.post_count) : null,
      lastPostMs: isFinite(lastPostRaw) ? lastPostRaw : null,
      totalHp,
      effectiveHp: totalHp + receivedHp - delegatedOutHp,
      receivedHp,
      delegatedOutHp,
      liquidHive: num(fad.balance),
      liquidHiveUsd: num(dollars.balance),
      liquidHbd: num(fad.hbd_balance),
      liquidHbdUsd: num(dollars.hbd_balance),
      savingsHive:
        num(fad.savings_balance) + num(fad.savings_pending_amount_hive),
      savingsHiveUsd:
        num(dollars.savings_balance) + num(dollars.savings_pending_amount_hive),
      savingsHbd:
        num(fad.hbd_saving_balance) + num(fad.savings_pending_amount_hbd),
      savingsHbdUsd:
        num(dollars.hbd_saving_balance) +
        num(dollars.savings_pending_amount_hbd),
      reputation: fad.reputation != null ? num(fad.reputation) : null,
      topHolderRankHive: rankOf("HIVE"),
      topHolderRankHbd: rankOf("HBD"),
      topHolderRankVests: rankOf("VESTS"),
      wealthComposition: buildWealthComposition(dollars),
      incomingDelegationsCount,
      incomingDelegationsHp,
      incomingRcDelegationsCount,
      outgoingRcDelegationsCount,
      proxyPowerHp,
      witnessesVotedFor:
        fad.witnesses_voted_for != null
          ? Number(fad.witnesses_voted_for)
          : null,
      proposalVotesCast: voteCount ?? null,
      isWitness: isActiveWitness,
      witnessRank: isActiveWitness ? (witnessDetails?.rank ?? null) : null,
      witnessVoteWeightHp:
        isActiveWitness && witnessDetails?.vests
          ? toHp(witnessDetails.vests)
          : null,
      witnessVoters: isActiveWitness
        ? (witnessDetails?.voters_num ?? null)
        : null,
      govVoteExpirationMs: isFinite(govMs) ? govMs : null,
      // ✍️ Activity & Content (windowed)
      postsW: sumCs((r) => r.posts),
      commentsW: sumCs((r) => r.comments),
      repliesReceivedW: sumCs((r) => r.replies_received),
      votesCastW: sumCs((r) => r.votes_cast),
      votesReceivedW: sumCs((r) => r.votes_received),
      contentUnavailable,
      totalOpsW: dappFootprint?.total_ops ?? null,
      topDapp: dappFootprint?.top_dapp ?? null,
      topCategory: dappFootprint?.top_category ?? null,
      dappCategories: dappFootprint?.categories ?? null,
      dappUnavailable,
      // 🤑 Earnings
      authorRewardsHbdW,
      authorRewardsHiveW,
      authorRewardsHpW,
      curationRewardsHpW,
      benefactorRewardsHpW,
      benefactorRewardsHbdW,
      producerRewardsHpW,
      interestHbdW,
      financialUnavailable,
      rewardsPerContentHbdEq: perContent(authorRewardsHbdEq),
      votesReceivedPerContent: perContent(votesRecWin),
      // ⚡ Resources & Momentum
      poweredUpHp,
      powerDownHp,
      netHpFlow:
        poweredUpHp == null && powerDownHp == null
          ? null
          : (poweredUpHp ?? 0) - (powerDownHp ?? 0),
      vestingUnavailable,
      rcPct: manabarsData?.rc?.percentageValue ?? null,
      votingManaPct: manabarsData?.upvote?.percentageValue ?? null,
    };
  }, [
    accountName,
    formattedAccountDetails,
    rawDetails,
    notFound,
    isLoading,
    hiveChain,
    dynamicGlobalData,
    rankEntries,
    accountProxyPower,
    voteCount,
    witnessDetails,
    incomingDelegationsCount,
    incomingDelegationsHp,
    incomingRcDelegationsCount,
    outgoingRcDelegationsCount,
    isWitness,
    accountContentStats,
    isAccountContentStatsLoading,
    isAccountContentStatsError,
    financialSummary,
    isFinancialSummaryLoading,
    isFinancialSummaryError,
    dappFootprint,
    isDappFootprintLoading,
    isDappFootprintError,
    accountVestingStats,
    isAccountVestingStatsLoading,
    isAccountVestingStatsError,
    manabarsData,
  ]);
};

export default useCompareAccount;
