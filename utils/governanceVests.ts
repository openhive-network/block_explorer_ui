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
