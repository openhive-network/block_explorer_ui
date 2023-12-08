import { useQuery, UseQueryResult } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";

const useAccountOperations = (
  accountName: string,
  operationFilters: number[] | undefined,
  pageSize: number,
  operationPage?: number,
) => {
  const {
    data: accountOperations,
    isLoading: isAccountOperationsLoading,
    isError: isAccountOperationsError,
  }: UseQueryResult<Hive.AccountOperationsResponse> = useQuery({
    queryKey: [
      "account_operations",
      accountName,
      operationPage,
      operationFilters,
    ],
    queryFn: () =>
      fetchingService.getOpsByAccount(
        accountName,
        pageSize,
        operationPage,
        operationFilters
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
