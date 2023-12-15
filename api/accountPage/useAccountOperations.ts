import { useQuery, UseQueryResult } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";

const useAccountOperations = (
  accountName: string,
  operationFilters: number[] | undefined,
  pageSize: number,
  operationPage?: number,
  fromBlock?: number,
  toBlock?: number,
  starDate?: Date,
  endDate?: Date
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
      fromBlock,
      toBlock,
      starDate,
      endDate
    ],
    queryFn: () =>
      fetchingService.getOpsByAccount(
        accountName,
        pageSize,
        operationPage,
        operationFilters,
        starDate,
        endDate,
        fromBlock,
        toBlock
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
