import { useQuery, UseQueryResult } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";
import Explorer from "@/types/Explorer";

const useAccountOperations = (
  accountOperationsProps?: Explorer.AccountSearchOperationsProps
) => {
  const {
    data: accountOperations,
    isLoading: isAccountOperationsLoading,
    isError: isAccountOperationsError,
  }: UseQueryResult<Hive.AccountOperationsResponse> = useQuery({
    queryKey: [
      "account_operations",
      accountOperationsProps
    ],
    queryFn: () => fetchAccountOperations(accountOperationsProps),
    refetchOnWindowFocus: false,
  });

  const fetchAccountOperations = async (accountOperationsProps: Explorer.AccountSearchOperationsProps | undefined) => {
    if (!accountOperationsProps) return null;
    return await fetchingService.getOpsByAccount(accountOperationsProps);
  }

  return {
    accountOperations,
    isAccountOperationsLoading,
    isAccountOperationsError,
  };
};

export default useAccountOperations;
