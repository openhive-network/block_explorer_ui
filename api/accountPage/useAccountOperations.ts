import { useQuery, UseQueryResult } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";
import Explorer from "@/types/Explorer";

const useAccountOperations = (
  accountOperationsProps: Explorer.AccountSearchOperationsProps
) => {
  const {
    data: accountOperations,
    isLoading: isAccountOperationsLoading,
    isError: isAccountOperationsError,
  }: UseQueryResult<Hive.AccountOperationsResponse> = useQuery({
    queryKey: [
      "account_operations",
      accountOperationsProps.accountName,
      accountOperationsProps.pageNumber,
      accountOperationsProps.operationTypes,
      accountOperationsProps.fromBlock,
      accountOperationsProps.toBlock,
      accountOperationsProps.startDate,
      accountOperationsProps.endDate,
    ],
    queryFn: () =>
      fetchingService.getOpsByAccount(
        accountOperationsProps
      ),
    refetchOnWindowFocus: false,
  });

  return {
    accountOperations,
    isAccountOperationsLoading,
    isAccountOperationsError,
  };
};

export default useAccountOperations;
