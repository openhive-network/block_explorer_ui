import { useQuery, UseQueryResult } from "@tanstack/react-query";

import Explorer from "@/types/Explorer";
import { config } from "@/Config";
import fetchingService from "@/services/FetchingService";
import { formatAndDelocalizeTime, parseChainDate } from "@/utils/TimeUtils";

// Hive leaves interest timestamps at the 1970 epoch until a payment actually
// happens, so formatting them would show a real-looking date for an event that
// never occurred. Empty string keeps the row out of the table entirely.
const formatTimeUnlessEpoch = (raw?: string | Date | null): string => {
  const parsed = raw instanceof Date ? raw : parseChainDate(raw);
  if (!parsed || parsed.getTime() === 0) return "";
  return formatAndDelocalizeTime(raw as string | Date);
};

const useAccountDetails = (accountName: string, liveDataEnabled: boolean) => {
  const {
    data: accountDetails,
    isLoading: isAccountDetailsLoading,
    isError: isAccountDetailsError,
  }: UseQueryResult<Explorer.FormattedAccountDetails> = useQuery({
    queryKey: ["account_details", accountName, liveDataEnabled],
    queryFn: () => getAccountDetails(accountName),
    refetchInterval: liveDataEnabled ? config.accountRefreshInterval : false,
    refetchOnWindowFocus: false,
    enabled: !!accountName && !!accountName.length,
  });

  const getAccountDetails = async (accountName: string) => {
    if (!accountName) return;

    const accountDetails = await fetchingService.getAccount(accountName);
    const { accounts } = await fetchingService.findAccounts([accountName]);
    const { follower_count, following_count } =
      await fetchingService.getAccountFollowCount(accountName);
    const subscriptions =
      await fetchingService.getAccountSubscriptions(accountName);
    const voteExpiration = formatAndDelocalizeTime(
      accounts[0].governance_vote_expiration_ts
    );
    const last_account_update = formatAndDelocalizeTime(
      accounts[0].last_account_update
    );
    const last_owner_update = formatAndDelocalizeTime(
      accounts[0].last_owner_update
    );
    const last_post = formatAndDelocalizeTime(accounts[0].last_post);
    const last_root_post = formatAndDelocalizeTime(accounts[0].last_root_post);
    const last_vote_time = formatAndDelocalizeTime(accounts[0].last_vote_time);
    const post_count = accounts[0].post_count;

    const result = {
      ...accountDetails,
      governance_vote_expiration_ts: voteExpiration || null,
      last_account_update,
      last_owner_update,
      last_post,
      last_root_post,
      last_vote_time,
      follower_count,
      following_count,
      subscriptions,
      post_count,
      // The liquid-HBD trio comes from hafbe (hbd_seconds passes through the
      // spread untouched). Only what hafbe actually returned is formatted, so
      // on a node that has yet to deploy them the rows stay absent rather than
      // reading "undefined".
      ...(formatTimeUnlessEpoch(accountDetails.hbd_seconds_last_update) && {
        hbd_seconds_last_update: formatTimeUnlessEpoch(
          accountDetails.hbd_seconds_last_update
        ),
      }),
      ...(formatTimeUnlessEpoch(accountDetails.hbd_last_interest_payment) && {
        hbd_last_interest_payment: formatTimeUnlessEpoch(
          accountDetails.hbd_last_interest_payment
        ),
      }),
      // No hafbe equivalent: the savings fields feed the pending-interest maths.
      savings_hbd_seconds: accounts[0].savings_hbd_seconds,
      savings_hbd_seconds_last_update:
        accounts[0].savings_hbd_seconds_last_update,
      savings_hbd_last_interest_payment: formatTimeUnlessEpoch(
        accounts[0].savings_hbd_last_interest_payment
      ),
    };

    return result;
  };

  return {
    accountDetails,
    isAccountDetailsLoading,
    isAccountDetailsError,
    notFound:
      !isAccountDetailsLoading && accountDetails && accountDetails.id === null,
  };
};

export default useAccountDetails;
