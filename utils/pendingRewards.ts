import Hive from "@/types/Hive";
import { naiAssetToFloat } from "@/utils/Calculations";

export interface PendingRewardsDerived {
  grossHbd: number;
  authorTotalHbd: number;
  beneficiariesTotalHbd: number;
  curatorsTotalHbd: number;
  curationTotalHbd: number;
  authorPct: number;
  beneficiariesPct: number;
  curatorsPct: number;
  avgPerPost: number | null;
  avgPerVote: number | null;
  yourTakeHbd: number;
  headlineHbd: number;
  isAllZero: boolean;
  // Liquid vs HP (vesting) split of the receivable amounts, in HBD basis.
  authorLiquidHbd: number;
  authorHpHbd: number;
  curatorsLiquidHbd: number;
  curatorsHpHbd: number;
  curationLiquidHbd: number;
  curationHpHbd: number;
  yourTakeLiquidHbd: number;
  yourTakeHpHbd: number;
}

interface LiquidHpSplit {
  total: number;
  liquid: number;
  hp: number;
}

// Each reward basis splits into total = direct + liquid + vesting (all HBD basis).
// vesting is paid as Hive Power; everything else (direct + liquid) is spendable.
const splitOf = (basis?: Hive.RewardBasis): LiquidHpSplit => {
  const total = naiAssetToFloat(basis?.total);
  const hp = naiAssetToFloat(basis?.vesting);
  const liquid = Math.max(0, total - hp);
  return { total, liquid, hp };
};

// Pure derivation so the card is presentation-only and the maths is unit-testable.
export const derivePendingRewards = (
  author?: Hive.PendingAuthorRewardsResponse,
  curation?: Hive.PendingCurationRewardsResponse
): PendingRewardsDerived => {
  const grossHbd = naiAssetToFloat(author?.gross_reward_basis);

  const authorSplit = splitOf(author?.author_reward_basis);
  const beneficiariesSplit = splitOf(author?.beneficiaries_reward_basis);
  const curatorsSplit = splitOf(author?.curators_reward_basis);
  const curationSplit = splitOf(curation?.curation_reward_basis);

  const authorTotalHbd = authorSplit.total;
  const beneficiariesTotalHbd = beneficiariesSplit.total;
  const curatorsTotalHbd = curatorsSplit.total;
  const curationTotalHbd = curationSplit.total;

  const authorPct = grossHbd > 0 ? (authorTotalHbd / grossHbd) * 100 : 0;
  const beneficiariesPct =
    grossHbd > 0 ? (beneficiariesTotalHbd / grossHbd) * 100 : 0;
  // Derived from the actual value (not a 100−rest remainder) so the bar's % and
  // the row's displayed amount can't disagree.
  const curatorsPct = grossHbd > 0 ? (curatorsTotalHbd / grossHbd) * 100 : 0;

  const postCount = author?.pending_post_count ?? 0;
  const voteCount = curation?.pending_vote_count ?? 0;
  const avgPerPost = postCount > 0 ? authorTotalHbd / postCount : null;
  const avgPerVote = voteCount > 0 ? curationTotalHbd / voteCount : null;

  // "Your take" and the headline reflect what the account actually receives —
  // the author's own share plus curation — not the gross pie (which includes
  // the curators of the account's own posts).
  const yourTakeHbd = authorTotalHbd + curationTotalHbd;
  const headlineHbd = yourTakeHbd;

  const isAllZero =
    !!author && !!curation && grossHbd === 0 && curationTotalHbd === 0;

  return {
    grossHbd,
    authorTotalHbd,
    beneficiariesTotalHbd,
    curatorsTotalHbd,
    curationTotalHbd,
    authorPct,
    beneficiariesPct,
    curatorsPct,
    avgPerPost,
    avgPerVote,
    yourTakeHbd,
    headlineHbd,
    isAllZero,
    authorLiquidHbd: authorSplit.liquid,
    authorHpHbd: authorSplit.hp,
    curatorsLiquidHbd: curatorsSplit.liquid,
    curatorsHpHbd: curatorsSplit.hp,
    curationLiquidHbd: curationSplit.liquid,
    curationHpHbd: curationSplit.hp,
    yourTakeLiquidHbd: authorSplit.liquid + curationSplit.liquid,
    yourTakeHpHbd: authorSplit.hp + curationSplit.hp,
  };
};
