import { useQuery, UseQueryResult } from "@tanstack/react-query";

import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";
import { config } from "@/Config";

const useAccountAuthorities = (
  accountName: string,
  liveDataEnabled: boolean
) => {
  const {
    data: accountAuthoritiesData,
    isLoading: accountAuthoritiesDataLoading,
    isError: accountAuthoritiesDataError,
  }: UseQueryResult<Hive.AccountAuthoritiesData> = useQuery({
    queryKey: ["account_authorities", accountName],
    queryFn: () => fetchingService.getAccountAuthorities(accountName),
    refetchInterval: liveDataEnabled ? config.accountRefreshInterval : false,
    refetchOnWindowFocus: false,
    enabled: !!accountName && !!accountName.length,
  });

  return {
    accountAuthoritiesData,
    accountAuthoritiesDataLoading,
    accountAuthoritiesDataError,
  };
};

export default useAccountAuthorities;
