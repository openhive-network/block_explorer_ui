import { useQuery, UseQueryResult } from "@tanstack/react-query";

import Explorer from "@/types/Explorer";
import { config } from "@/Config";
import fetchingService from "@/services/FetchingService";

const useAccountDetails = (accountName: string, liveDataEnabled: boolean) => {
  const {
    data: accountDetails,
    isLoading: isAccountDetailsLoading,
    isError: isAccountDetailsError,
  }: UseQueryResult<Explorer.FormattedAccountDetails> = useQuery({
    queryKey: ["account_details", accountName, liveDataEnabled],
    queryFn: () => fetchingService.getAccount(accountName),
    refetchInterval: liveDataEnabled ? config.accountRefreshInterval : false,
    refetchOnWindowFocus: false,
    enabled: !!accountName && !!accountName.length,
  });

  return {
    accountDetails,
    isAccountDetailsLoading,
    isAccountDetailsError,
    notFound:
      !isAccountDetailsLoading && accountDetails && accountDetails.id === null,
  };
};

export default useAccountDetails;
