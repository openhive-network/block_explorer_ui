import { useQuery, UseQueryResult } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";

const useAccountAuthorities = (accountName: string) => {
  const {
    data: accountAuthoritiesData,
    isLoading: accountAuthoritiesDataLoading,
    isError: accountAuthoritiesDataError,
  }: UseQueryResult<Hive.AccountAuthoritiesData> = useQuery({
    queryKey: ["account_authorities", accountName],
    queryFn: () => fetchingService.getAccountAuthorities(accountName),
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
