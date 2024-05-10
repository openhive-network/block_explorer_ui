import { useQuery, UseQueryResult } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";

const useAccountAuthorizations = (accountName: string) => {
  const {
    data: accountOperationTypes,
    isLoading: isAccountOperationTypesLoading,
    isError: isAccountOperationTypesError,
  }: UseQueryResult<unknown> = useQuery({
    queryKey: ["account_authorization", accountName],
    queryFn: () => fetchingService.getAccountAuthorizations(accountName),
    refetchOnWindowFocus: false,
    enabled: !!accountName && !!accountName.length,
  });

  return {
    accountOperationTypes,
    isAccountOperationTypesLoading,
    isAccountOperationTypesError,
  };
};

export default useAccountAuthorizations;
