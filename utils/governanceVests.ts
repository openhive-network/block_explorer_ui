import { parseChainDate } from "@/utils/TimeUtils";

// An account's weight in proposal and witness votes, in raw VESTS units, from
// a database_api.find_accounts entry fetched with delayed_votes_active: true
// (FetchingService.findAccounts' default). It matches hived's
// get_governance_vote_power().
//
// Since HF24, powered-up VESTS only count in governance once their 30-day delay
// ends, so the direct part is vesting_shares minus delayed_votes.
// proxied_vsf_votes is already counted that way by hived.

interface GovernanceAccount {
  vesting_shares?: { amount?: string } | null;
  delayed_votes?: ReadonlyArray<{ val?: number | string }> | null;
  proxied_vsf_votes?: ReadonlyArray<number | string> | null;
}

const sum = (values: ReadonlyArray<number | string | undefined>): number =>
  values.reduce<number>((total, value) => total + (Number(value) || 0), 0);

export const governanceVests = (account: GovernanceAccount) => {
  const owned = Number(account.vesting_shares?.amount) || 0;
  const delayed = sum((account.delayed_votes ?? []).map((vote) => vote?.val));
  const direct = Math.max(0, owned - delayed);
  const proxied = sum(account.proxied_vsf_votes ?? []);
  return { direct, proxied, total: direct + proxied };
};

// What the logged-in user menu shows: the weight in HP, and whether it is
// counting. hived clears an account's votes a year after its last governance
// action and leaves governance_vote_expiration_ts in the past (1969-12-31 for
// an account that never voted). With a proxy set, the proxy casts the votes.
// A proxy setting lapses like the account's own votes (HF25), so it carries
// the same expiry.
export type GovernanceWeight =
  | { status: "proxy"; hp: number; proxy: string; expires: Date | null }
  | { status: "active"; hp: number; expires: Date | null }
  | { status: "inactive"; hp: number };

interface WeightAccount extends GovernanceAccount {
  vesting_shares?: { amount?: string; precision?: number } | null;
  proxy?: string | null;
  governance_vote_expiration_ts?: string | Date | null;
}

const VESTS_PRECISION = 6;

export const governanceWeight = (
  account: WeightAccount,
  hivePerVests: number,
  now: Date = new Date()
): GovernanceWeight => {
  const precision = account.vesting_shares?.precision ?? VESTS_PRECISION;
  const hp = (governanceVests(account).total / 10 ** precision) * hivePerVests;
  const raw = account.governance_vote_expiration_ts;
  const expires =
    raw instanceof Date ? raw : parseChainDate(raw ? String(raw) : null);
  if (account.proxy)
    return {
      status: "proxy",
      hp,
      proxy: account.proxy,
      expires: expires && expires > now ? expires : null,
    };
  if (expires && expires <= now) return { status: "inactive", hp };
  return { status: "active", hp, expires };
};
