// Hive's vote arithmetic, as hived does it, for the Voting Power tool (#790).

// Integer constants from hived (libraries/protocol/include/hive/protocol/config.hpp).
const HIVE_100_PERCENT = BigInt(10000);
const SECONDS_PER_DAY = BigInt(86400);
// HIVE_VOTING_MANA_REGENERATION_SECONDS: an empty voting manabar refills in 5 days.
const MANA_REGENERATION_SECONDS = BigInt(432000);
// HIVE_VOTE_DUST_THRESHOLD: taken off every vote, so a tiny vote adds nothing.
export const VOTE_DUST_THRESHOLD = BigInt(50000000);
const ZERO = BigInt(0);
const ONE = BigInt(1);

// The rshares a vote adds, as vote_evaluator computes them since HF25:
// used_mana = current_mana * weight * 86400 / 10000 (floor), then divided by
// vote_power_reserve_rate * 432000 rounding up, minus the dust threshold.
// With the chain's rate of 10, a 100% vote spends 2% of the current mana.
//
// currentMana is the voting manabar's current value (VESTS with 6 implied
// decimals); weightPercent is the vote weight, 0 to 100.
export const upvoteRshares = (
  currentMana: bigint,
  weightPercent: number,
  votePowerReserveRate: number
): bigint => {
  const clamped = Math.min(100, Math.max(0, weightPercent));
  const weight = BigInt(Math.round(clamped * 100));
  if (weight === ZERO || currentMana <= ZERO || !(votePowerReserveRate > 0))
    return ZERO;
  const usedMana = (currentMana * weight * SECONDS_PER_DAY) / HIVE_100_PERCENT;
  const maxVoteDenom = BigInt(votePowerReserveRate) * MANA_REGENERATION_SECONDS;
  const used = (usedMana + maxVoteDenom - ONE) / maxVoteDenom;
  const rshares = used - VOTE_DUST_THRESHOLD;
  return rshares > ZERO ? rshares : ZERO;
};

export interface RewardFundFigures {
  // The "post" reward fund's balance, in HIVE.
  rewardBalanceHive: number;
  // Its recent_claims, as the node returns it (too large for a Number).
  recentClaims: string;
  // The median price feed, in HBD per HIVE.
  hbdPerHive: number;
}

// What rshares add to a post's payout, in HBD. The post fund's curve is linear,
// so a post's payout is its rshares' share of recent_claims, times the fund
// balance, at the median price. That payout is then split between the author
// and the curators.
export const rsharesToHbd = (
  rshares: bigint,
  { rewardBalanceHive, recentClaims, hbdPerHive }: RewardFundFigures
): number => {
  const claims = Number(recentClaims);
  if (!(claims > 0) || rshares <= ZERO) return 0;
  return (Number(rshares) / claims) * rewardBalanceHive * hbdPerHive;
};
