import { useQuery, UseQueryResult } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";

const useAccountOperations = (
  accountName: string,
  operationPage: number,
  operationFilters: number[],
  opeartionLimit: number
) => {
  const {
    data: accountOperations,
    isLoading: isAccountOperationsLoading,
    isError: isAccountOperationsError,
  }: UseQueryResult<Hive.OperationResponse[]> = useQuery({
    queryKey: [
      "account_operations",
      accountName,
      operationPage,
      operationFilters,
    ],
    queryFn: () =>
      fetchingService.getOpsByAccount(
        accountName,
        operationPage,
        opeartionLimit,
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
