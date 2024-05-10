import { useQuery, UseQueryResult } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";

const useAccountAuthorizations = (accountName: string) => {
  const {
    data: accountAuthorizationsData,
    isLoading: accountAuthorizationsDataLoading,
    isError: accountAuthorizationsDataError,
  }: UseQueryResult<Hive.AccountAuthorizationsData> = useQuery({
    queryKey: ["account_authorization", accountName],
    queryFn: () => fetchingService.getAccountAuthorizations(accountName),
    refetchOnWindowFocus: false,
    enabled: !!accountName && !!accountName.length,
  });

  return {
    accountAuthorizationsData,
    accountAuthorizationsDataLoading,
    accountAuthorizationsDataError,
  };
};

export default useAccountAuthorizations;
