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

    const voteExpiration = formatAndDelocalizeTime(
      accounts[0].governance_vote_expiration_ts
    );

    const result = {
      ...accountDetails,
      governance_vote_expiration_ts: voteExpiration || null,
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
