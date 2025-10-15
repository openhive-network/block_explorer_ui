import { useQuery, UseQueryResult } from "@tanstack/react-query";

import Explorer from "@/types/Explorer";
import { config } from "@/Config";
import fetchingService from "@/services/FetchingService";
import { formatAndDelocalizeTime } from "@/utils/TimeUtils";

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
    const { follower_count, following_count } = await fetchingService.getAccountFollowCount(accountName);
    const subscriptions  = await fetchingService.getAccountSubscriptions(accountName);
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
      post_count
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
