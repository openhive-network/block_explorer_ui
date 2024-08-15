import { useQuery, UseQueryResult } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";
import Explorer from "@/types/Explorer";

const useAccountOperations = (
  accountOperationsProps?: Explorer.AccountSearchOperationsProps,
) => {
  const fetchAccountOperations = async (
    accountOperationsProps: Explorer.AccountSearchOperationsProps | undefined
  ) => {
    if (!accountOperationsProps) return null;
    console.log("Fetching account operations with props:", accountOperationsProps);
    return await fetchingService.getOpsByAccount(accountOperationsProps);
  };

  const {
    data: accountOperations,
    isFetching: isAccountOperationsLoading,
    isError: isAccountOperationsError,
    refetch: refetchAccountOperations
  }: UseQueryResult<Hive.AccountOperationsResponse> = useQuery({
    queryKey: ["account_operations", accountOperationsProps],
    queryFn: () => fetchAccountOperations(accountOperationsProps),
    refetchOnWindowFocus: false,
    enabled:
      !!accountOperationsProps?.accountName &&
      !!accountOperationsProps?.accountName.length,
  });

  return {
    accountOperations,
    isAccountOperationsLoading,
    isAccountOperationsError,
    refetchAccountOperations
  };
};

export default useAccountOperations;
