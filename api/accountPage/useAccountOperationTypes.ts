import { useQuery, UseQueryResult } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";

const useAccountOperationTypes = (accountName: string) => {
  const {
    data: accountOperationTypes,
    isLoading: isAccountOperationTypesLoading,
    isError: isAccountOperationTypesError,
  }: UseQueryResult<Hive.OperationPattern[]> = useQuery({
    queryKey: ["account_operation_types", accountName],
    queryFn: () => fetchingService.getAccOpTypes(accountName),
    refetchOnWindowFocus: false,
  });

  return {
    accountOperationTypes,
    isAccountOperationTypesLoading,
    isAccountOperationTypesError,
  };
};

export default useAccountOperationTypes;
